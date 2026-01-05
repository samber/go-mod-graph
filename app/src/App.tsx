import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { STORAGE_KEYS } from './services/types';
import {
  Header,
  SettingsPanel,
  SearchForm,
  CustomNode,
  FocusOnTopNode,
  EmptyState,
  GraphStats,
  Loader,
} from './components';
import { useModuleGraph } from './hooks';
import { useModuleInput } from './hooks/useModuleInput';
import { useDarkMode } from './hooks/useDarkMode';
import './App.css';

function App() {
  // Dark mode hook
  const { isDark, toggleDarkMode } = useDarkMode();
  // Settings state using localStorage hooks
  const [proxyUrl, setProxyUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PROXY_URL) || 'https://proxy.golang.org';
  });
  const [includeWeights, setIncludeWeights] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.INCLUDE_WEIGHTS) === 'true';
  });
  const [showSettings, setShowSettings] = useState(false);

  // Module input hook
  const { moduleInput, setModuleInput, parseModuleInput } = useModuleInput();

  // Release selector state
  const [selectedRelease, setSelectedVersion] = useState<string | null>(null);

  // Graph management hook
  const {
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
  } = useModuleGraph({ proxyUrl, includeWeights });

  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const focusOnTopNodeRef = useRef(false);

  // Save includeWeights to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCLUDE_WEIGHTS, String(includeWeights));
  }, [includeWeights]);

  // Save proxyUrl to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROXY_URL, proxyUrl);
  }, [proxyUrl]);

  // Extract version from module input and move to selector
  useEffect(() => {
    const { release } = parseModuleInput(moduleInput);
    if (release !== selectedRelease) {
      setSelectedVersion(release);
    }
  }, [moduleInput, selectedRelease, parseModuleInput]);

  // Load versions when module path changes (without version)
  useEffect(() => {
    const { path, release } = parseModuleInput(moduleInput);
    if (path && !release && path.includes('.')) {
      const timeoutId = setTimeout(() => {
        loadVersions(path);
      }, 2000); // Debounce (2 seconds)
      return () => clearTimeout(timeoutId);
    }
  }, [moduleInput, parseModuleInput, loadVersions]);

  const handleHomeClick = useCallback(() => {
    setModuleInput('');
    setSelectedVersion(null);
    clearGraph();
  }, [setModuleInput, clearGraph]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGraph(moduleInput, selectedRelease);
  };

  const handleExampleClick = (modulePath: string) => {
    setModuleInput(modulePath);
    setSelectedVersion(null);
    // Load the graph immediately with the provided path
    loadGraph(modulePath, null);
  };

  const handleReleaseSelect = (release: string) => {
    setSelectedVersion(release);
    // Update the input to include the version
    const { path } = parseModuleInput(moduleInput);
    if (path && path.includes('.')) {
      const updatedInput = `${path}@${release}`;
      setModuleInput(updatedInput);
      // Load the graph with the new release
      loadGraph(updatedInput, release);
    }
  };

  const handleReleaseClear = () => {
    setSelectedVersion(null);
    // Remove the version from the input
    const { path } = parseModuleInput(moduleInput);
    if (path) {
      setModuleInput(path);
    }
  };

  // Custom node type
  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    [includeWeights]
  );

  // Calculate total size from nodes
  const totalSize = useMemo(() => {
    return nodes.reduce((sum, node) => {
      const size = (node.data as any).size;
      return sum + (typeof size === 'number' ? size : 0);
    }, 0);
  }, [nodes]);

  // Update edges with hover styles
  const edgesWithHover = useMemo(() => {
    return edges.map((edge) => {
      const isHovered = hoveredEdgeId === edge.id;
      const baseStyle = typeof edge.style === 'object' && edge.style !== null ? edge.style : {};
      const baseMarkerEnd = edge.markerEnd && typeof edge.markerEnd === 'object'
        ? edge.markerEnd
        : { type: 'arrowclosed' as any, width: 20, height: 20, color: '#57534e' };
      return {
        ...edge,
        style: {
          ...(baseStyle as Record<string, any>),
          stroke: isHovered ? '#1e40af' : '#57534e',
          strokeWidth: isHovered ? 4 : 2.5,
          opacity: isHovered ? 1 : 0.8,
        },
        markerEnd: {
          ...(baseMarkerEnd as Record<string, any>),
          color: isHovered ? '#1e40af' : '#57534e',
        } as any,
      };
    });
  }, [edges, hoveredEdgeId]);

  return (
    <div className="app">
      {/* Header */}
      <Header
        onSettingsToggle={() => setShowSettings(!showSettings)}
        onHomeClick={handleHomeClick}
        isDarkMode={isDark}
        onDarkModeToggle={toggleDarkMode}
      />

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          proxyUrl={proxyUrl}
          onProxyUrlChange={setProxyUrl}
          onClose={() => setShowSettings(false)}
          includeWeights={includeWeights}
          onIncludeWeightsChange={setIncludeWeights}
        />
      )}

      {/* Search */}
      <div className="search">
        <div className="max-w">
          <form onSubmit={handleSubmit} className="search-form">
            <SearchForm
              moduleInput={moduleInput}
              onModuleInputChange={setModuleInput}
              releases={releases}
              selectedRelease={selectedRelease}
              onReleaseSelect={handleReleaseSelect}
              onReleaseClear={handleReleaseClear}
              loading={loading}
              onExampleClick={handleExampleClick}
              nodeCount={nodes.length}
              totalSize={totalSize}
              includeWeights={includeWeights}
            />
          </form>

          {/* Error */}
          {error && <div className="error">{error}</div>}
        </div>
      </div>

      {/* Graph */}
      <div className="graph-container">
        {loading && nodes.length === 0 ? (
          <div className="loading-state">
            <Loader className="loading-spinner-large" />
            <p className="loading-state-text">Loading dependency graph...</p>
          </div>
        ) : nodes.length === 0 ? (
          <EmptyState onExampleClick={handleExampleClick} />
        ) : (
          <>
            <ReactFlow
              nodes={nodes}
              edges={edgesWithHover}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
              onEdgeMouseLeave={() => setHoveredEdgeId(null)}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              zoomOnScroll={true}
              panOnScroll={false}
              defaultEdgeOptions={{
                type: 'bezier',
                style: { stroke: '#57534e', strokeWidth: 2.5, opacity: 0.8 },
                markerEnd: { type: 'arrowclosed' as any, width: 20, height: 20, color: '#57534e' },
              }}
              style={{ backgroundColor: 'var(--color-bg)' }}
            >
              <Background color="var(--color-border)" gap={16} />
              <Controls />
              <MiniMap
                nodeColor={() => 'var(--color-bg-secondary)'}
                maskColor="rgba(0, 0, 0, 0.1)"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
              />
              <FocusOnTopNode nodes={nodes} hasFocusedRef={focusOnTopNodeRef} />
            </ReactFlow>
            <GraphStats
              nodeCount={nodes.length}
              edgeCount={edges.length}
              totalSize={includeWeights ? totalSize : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
