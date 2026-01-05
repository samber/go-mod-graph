// Custom hook for loading and managing module dependency graphs

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import { useNodesState, useEdgesState } from 'reactflow';
import { ConnectionLineType, Position } from 'reactflow';
import {
  getDependencyGraph,
  getModuleReleases,
  getLatestRelease,
  flattenDependencyTree,
} from '../services/goProxy';
import type { DependencyNode } from '../services/types';
import dagre from '@dagrejs/dagre';

// Sort releases by date (descending)
const sortReleasesByDate = (releases: string[]): string[] => {
  return [...releases].sort((a, b) => {
    const pseudoVersionRegex = /-v?\d+\.\d+\.\d+(\.\d+)?\.(\d{14})-/;
    const aMatch = a.match(pseudoVersionRegex);
    const bMatch = b.match(pseudoVersionRegex);

    if (aMatch && bMatch) {
      return bMatch[2].localeCompare(aMatch[2]);
    } else if (aMatch) {
      return -1;
    } else if (bMatch) {
      return 1;
    } else {
      return b.localeCompare(a);
    }
  });
};

type FlowNodeData = DependencyNode & {
  x: number;
  y: number;
};

type UseModuleGraphOptions = {
  proxyUrl: string;
  includeWeights: boolean;
};

type UseModuleGraphResult = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  releases: string[];
  loading: boolean;
  error: string | null;
  loadGraph: (moduleInput: string, selectedRelease: string | null) => Promise<void>;
  loadVersions: (modulePath: string) => Promise<void>;
  clearGraph: () => void;
};

// Layout nodes using dagre for vertical (top-to-bottom) orientation
const layoutNodes = (
  nodes: Node<FlowNodeData>[],
  edges: Edge[]
): Node<FlowNodeData>[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: 150,
    ranksep: 200,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });
};

export function useModuleGraph({ proxyUrl, includeWeights }: UseModuleGraphOptions): UseModuleGraphResult {
  const [releases, setReleases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const focusOnTopNodeRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const loadVersions = useCallback(async (modulePath: string) => {
    try {
      const versionList = await getModuleReleases(proxyUrl, modulePath);

      if (versionList.length === 0) {
        try {
          const latest = await getLatestRelease(proxyUrl, modulePath);
          setReleases([latest]);
        } catch {
          setReleases([]);
        }
      } else {
        const sortedVersions = sortReleasesByDate(versionList);
        setReleases(sortedVersions);
      }
    } catch (e) {
      console.warn('Could not load versions:', e);
      setReleases([]);
    }
  }, [proxyUrl]);

  const loadGraph = useCallback(async (moduleInput: string, selectedRelease: string | null) => {
    if (!moduleInput.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    setNodes([]);
    setEdges([]);

    try {
      // Parse module input to extract path and release
      const withoutProtocol = moduleInput.replace(/^https?:\/\//, '');
      const match = withoutProtocol.match(/^(.+?)(?:@(.+))?$/);
      const path = match ? match[1].trim().toLowerCase() : withoutProtocol.trim().toLowerCase();
      const release = match?.[2] || null;

      // Use selected version from selector if no version in input
      const finalVersion = release || selectedRelease || undefined;

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Load versions if not loaded yet
      if (!release && releases.length === 0) {
        await loadVersions(path);
      }

      // Check if request was aborted again
      if (abortController.signal.aborted) {
        return;
      }

      const graph = await getDependencyGraph(proxyUrl, path, finalVersion, includeWeights);
      const { nodes: flatNodes, edges: flatEdges } = flattenDependencyTree(graph);

      // Check if request was aborted before updating state
      if (abortController.signal.aborted) {
        return;
      }

      const initialNodes: Node<FlowNodeData>[] = Array.from(flatNodes.values()).map((n) => ({
        id: n.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: n,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      }));

      const flowEdges: Edge[] = Array.from(flatEdges.values()).map((edge) => ({
        ...edge,
        type: ConnectionLineType.Bezier,
        animated: false,
        style: {
          stroke: '#57534e',
          strokeWidth: 2.5,
          opacity: 0.8,
        },
        markerEnd: {
          type: 'arrowclosed' as any,
          width: 20,
          height: 20,
          color: '#57534e',
        },
      }));

      const layoutedNodes = layoutNodes(initialNodes, flowEdges);

      // Final check before updating state
      if (abortController.signal.aborted) {
        return;
      }

      setNodes(layoutedNodes);
      setEdges(flowEdges);

      console.log(`Loaded ${layoutedNodes.length} dependencies for ${path}@${finalVersion || 'latest'}`);

      focusOnTopNodeRef.current = false;
    } catch (e) {
      // Don't set error if request was aborted
      if (e instanceof Error && e.name === 'AbortError') {
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load module');
      setNodes([]);
      setEdges([]);
    } finally {
      // Only clear loading if this is still the current request
      if (abortController === abortControllerRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [proxyUrl, includeWeights, releases, setNodes, setEdges, loadVersions]);

  const clearGraph = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setNodes([]);
    setEdges([]);
    setError(null);
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    releases,
    loading,
    error,
    loadGraph,
    loadVersions,
    clearGraph,
  };
}
