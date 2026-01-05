// Type definitions for Go module proxy integration

export type GoModule = {
  Path: string;
  Version?: string;
};

export type DependencyNode = {
  id: string;
  path: string;
  release: string;
  size?: number; // Size in bytes
  children: DependencyNode[];
};

// For ReactFlow nodes
export type FlowNodeData = DependencyNode & {
  x: number;
  y: number;
};

export type StorageKeys = {
  readonly PROXY_URL: string;
  readonly INCLUDE_WEIGHTS: string;
};

export const STORAGE_KEYS: StorageKeys = {
  PROXY_URL: 'go-mod-graph.goProxyUrl',
  INCLUDE_WEIGHTS: 'go-mod-graph.includeWeights',
} as const;
