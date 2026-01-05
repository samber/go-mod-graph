// Minimal Version Selection (MVS) algorithm implementation

import type { GoModule, DependencyNode } from '../types';
import { normalizeModulePath, getGoMod } from './moduleApi';
import { getModuleSize } from './sizeApi';

// Track version comparisons for MVS
function compareVersions(v1: string, v2: string): number {
  // Handle pseudo-versions (v0.0.0-YYYYMMDDhhmmss-abcdef)
  const pseudoRegex = /^v0\.0\.0-\d{14}-[a-f0-9]+$/;
  const v1IsPseudo = pseudoRegex.test(v1);
  const v2IsPseudo = pseudoRegex.test(v2);

  if (v1IsPseudo && v2IsPseudo) {
    // Compare pseudo-versions by timestamp
    const v1Timestamp = v1.match(/-(\d{14})-/)?.[1];
    const v2Timestamp = v2.match(/-(\d{14})-/)?.[1];
    if (v1Timestamp && v2Timestamp) {
      return v1Timestamp.localeCompare(v2Timestamp);
    }
  }

  // For regular versions or mixed, use semver comparison
  // Remove 'v' prefix and compare
  const cleanV1 = v1.replace(/^v/, '');
  const cleanV2 = v2.replace(/^v/, '');

  const parts1 = cleanV1.split('.');
  const parts2 = cleanV2.split('.');

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || '0';
    const p2 = parts2[i] || '0';

    // Handle pre-release versions (have a dash)
    if (p1.includes('-') && !p2.includes('-')) return -1;
    if (!p1.includes('-') && p2.includes('-')) return 1;
    if (p1.includes('-') && p2.includes('-')) {
      const [v1Num, v1Pre] = p1.split('-');
      const [v2Num, v2Pre] = p2.split('-');
      const numCompare = parseInt(v1Num) - parseInt(v2Num);
      if (numCompare !== 0) return numCompare;
      return v1Pre.localeCompare(v2Pre);
    }

    const num1 = parseInt(p1) || 0;
    const num2 = parseInt(p2) || 0;
    if (num1 !== num2) return num1 - num2;
  }

  return 0;
}

// Build dependency tree using proper MVS algorithm
export const buildDependencyTreeWithMVS = async (
  proxyUrl: string,
  rootModulePath: string,
  rootRelease: string,
  includeSizes = false,
  maxDepth = 50
): Promise<DependencyNode> => {
  // Map of module path -> selected version
  const selected = new Map<string, string>();
  // Map of module path -> size (if includeSizes is true)
  const sizes = new Map<string, number | null>();
  // Map of module path -> list of modules that depend on it (for building the tree)
  const dependents = new Map<string, Set<string>>();
  // Map of module path -> its dependencies (for the selected version)
  const dependencies = new Map<string, GoModule[]>();

  // Queue of modules to process: { path, version, requiredBy }
  type QueueItem = { path: string; version: string; requiredBy: string | null };
  const queue: QueueItem[] = [];

  // Initialize with root module
  queue.push({ path: rootModulePath, version: rootRelease, requiredBy: null });

  // Process queue until empty (MVS algorithm)
  while (queue.length > 0) {
    const item = queue.shift()!;
    const { path: rawPath, version, requiredBy: rawRequiredBy } = item;

    // Normalize paths to ensure consistency (remove quotes if present)
    const path = normalizeModulePath(rawPath);
    const requiredBy = rawRequiredBy ? normalizeModulePath(rawRequiredBy) : null;

    // Track who requires this module
    if (requiredBy) {
      if (!dependents.has(path)) {
        dependents.set(path, new Set());
      }
      dependents.get(path)!.add(requiredBy);
    }

    // Check if this module is already selected with a version
    const currentSelected = selected.get(path);

    if (currentSelected) {
      // If already selected, only reprocess if this version is higher
      if (compareVersions(version, currentSelected) > 0) {
        // Version bump! Update selected version
        selected.set(path, version);

        // Re-fetch dependencies for the new version
        try {
          const deps = await getGoMod(proxyUrl, path, version);
          dependencies.set(path, deps);

          // Fetch size if enabled
          if (includeSizes && !sizes.has(path)) {
            const size = await getModuleSize(proxyUrl, path, version);
            sizes.set(path, size);
          }

          // Queue all dependencies for processing
          for (const dep of deps) {
            queue.push({
              path: normalizeModulePath(dep.Path),
              version: dep.Version || 'latest',
              requiredBy: path,
            });
          }
        } catch (e) {
          // Module failed to load, mark with unknown version
          dependencies.set(path, []);
        }
      }
      // If version is lower or equal, do nothing (MVS rule)
    } else {
      // First time seeing this module
      selected.set(path, version);

      // Fetch its dependencies
      try {
        const deps = await getGoMod(proxyUrl, path, version);
        dependencies.set(path, deps);

        // Fetch size if enabled
        if (includeSizes) {
          const size = await getModuleSize(proxyUrl, path, version);
          sizes.set(path, size);
        }

        // Queue all dependencies for processing
        for (const dep of deps) {
          queue.push({
            path: normalizeModulePath(dep.Path),
            version: dep.Version || 'latest',
            requiredBy: path,
          });
        }
      } catch (e) {
        // Module failed to load
        dependencies.set(path, []);
      }
    }
  }

  // Build the tree structure from selected modules and their dependencies
  // Normalize the root module path before building the tree
  const normalizedRootPath = normalizeModulePath(rootModulePath);
  return buildTreeFromSelected(
    normalizedRootPath,
    selected,
    sizes,
    dependencies,
    dependents,
    0,
    maxDepth
  );
};

// Build tree structure from MVS results
function buildTreeFromSelected(
  modulePath: string,
  selected: Map<string, string>,
  sizes: Map<string, number | null>,
  dependencies: Map<string, GoModule[]>,
  dependents: Map<string, Set<string>>,
  depth: number,
  maxDepth: number,
  visited = new Set<string>()
): DependencyNode {
  const version = selected.get(modulePath) || 'unknown';
  const id = `${modulePath}@${version}`;
  const size = sizes.get(modulePath) || undefined;

  if (visited.has(id) || depth > maxDepth) {
    return { id, path: modulePath, release: version, children: [] };
  }

  visited.add(id);

  // Get dependencies for this module (from the selected version)
  const deps = dependencies.get(modulePath) || [];

  // Build child nodes
  const children: DependencyNode[] = [];
  for (const dep of deps) {
    const normalizedDepPath = normalizeModulePath(dep.Path);
    const depVersion = selected.get(normalizedDepPath);
    if (depVersion) {
      children.push(
        buildTreeFromSelected(
          normalizedDepPath,
          selected,
          sizes,
          dependencies,
          dependents,
          depth + 1,
          maxDepth,
          visited
        )
      );
    }
  }

  return { id, path: modulePath, release: version, size, children };
}

// Convert tree to nodes and edges for ReactFlow
export const flattenDependencyTree = (root: DependencyNode) => {
  type FlowNodeData = DependencyNode & {
    x: number;
    y: number;
  };

  const treeToNodes = (
    node: DependencyNode,
    nodes: Map<string, FlowNodeData> = new Map(),
    edges: Map<string, { id: string; source: string; target: string }> = new Map(),
    level = 0,
    horizontalOffset = 0,
    visited = new Set<string>()
  ): { nodes: Map<string, FlowNodeData>; edges: Map<string, any> } => {
    if (visited.has(node.id)) {
      return { nodes, edges };
    }
    visited.add(node.id);

    const existingNode = nodes.get(node.id);
    if (!existingNode) {
      nodes.set(node.id, {
        id: node.id,
        path: node.path,
        release: node.release,
        size: node.size,
        x: horizontalOffset * 300,
        y: level * 150,
        children: node.children,
      });
    }

    for (const child of node.children) {
      const edgeId = `${node.id}-${child.id}`;
      // Create edge if it doesn't already exist
      if (!edges.has(edgeId)) {
        edges.set(edgeId, {
          id: edgeId,
          source: node.id,
          target: child.id,
        });
      }
      // Process child node (even if visited, to ensure it exists in the graph)
      treeToNodes(child, nodes, edges, level + 1, horizontalOffset + nodes.size % 3, visited);
    }

    return { nodes, edges };
  };

  return treeToNodes(root);
};
