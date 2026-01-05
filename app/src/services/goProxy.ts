// Main export file for Go Proxy services
// Re-exports all functionality from modular API files

// Config
export { LOCAL_PROXY_URL } from './config';

// Types
export type {
  GoModule,
  DependencyNode,
  FlowNodeData,
  StorageKeys,
} from './types';
export { STORAGE_KEYS } from './types';

// Errors
export {
  ModuleNotFoundError,
  ReleaseNotFoundError,
} from './errors';

// Module API
export {
  getLatestRelease,
  getModuleReleases,
  getGoMod,
  normalizeModulePath,
} from './api/moduleApi';

// Size API
export {
  getModuleSize,
  formatBytes,
  getSizeColor,
  getSizeTextColor,
} from './api/sizeApi';

// MVS API
export {
  buildDependencyTreeWithMVS,
  flattenDependencyTree,
} from './api/mvsApi';

// Main API - getDependencyGraph
import { buildDependencyTreeWithMVS } from './api/mvsApi';
import { getLatestRelease } from './api/moduleApi';
import type { DependencyNode } from './types';

export const getDependencyGraph = async (
  proxyUrl: string,
  modulePath: string,
  release?: string,
  includeSizes = false
): Promise<DependencyNode> => {
  const actualRelease = release || await getLatestRelease(proxyUrl, modulePath);
  return buildDependencyTreeWithMVS(proxyUrl, modulePath, actualRelease, includeSizes);
};
