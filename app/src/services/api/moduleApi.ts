// Go Module Proxy API - Basic module operations

import type { GoModule } from '../types';
import { LOCAL_PROXY_URL } from '../config';
import { ModuleNotFoundError, ReleaseNotFoundError } from '../errors';

const fetchFromProxy = async (proxyUrl: string, path: string): Promise<string> => {
  // Use local proxy server to bypass CORS
  const url = `${LOCAL_PROXY_URL}/proxy?path=${encodeURIComponent(path)}&proxy=${encodeURIComponent(proxyUrl)}`;
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error(`Not found: ${path}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();

  return text;
};

export const getLatestRelease = async (proxyUrl: string, modulePath: string): Promise<string> => {
  try {
    const data = await fetchFromProxy(proxyUrl, `/${modulePath}/@latest`);
    const latest = JSON.parse(data);
    if (!latest.Version) {
      throw new ModuleNotFoundError(modulePath);
    }
    return latest.Version;
  } catch (e: any) {
    if (e.message?.includes('Not found')) {
      throw new ModuleNotFoundError(modulePath);
    }
    throw new Error(`Failed to get latest release for "${modulePath}": ${e.message}`);
  }
};

export const getModuleReleases = async (proxyUrl: string, modulePath: string): Promise<string[]> => {
  try {
    const data = await fetchFromProxy(proxyUrl, `/${modulePath}/@v/list`);
    const versions = data
      .split('\n')
      .filter((line: string) => line.trim().length > 0);

    return versions.reverse();
  } catch (e: any) {
    if (e instanceof ModuleNotFoundError) {
      throw e;
    }
    if (e.message?.includes('Not found')) {
      throw new ModuleNotFoundError(modulePath);
    }
    throw new Error(`Failed to get releases for "${modulePath}": ${e.message}`);
  }
};

// Normalize module path by removing surrounding quotes and lowercasing
export const normalizeModulePath = (path: string): string => {
  // Remove surrounding quotes if present
  const trimmed = path.trim();
  let normalized = trimmed;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    normalized = trimmed.slice(1, -1);
  }
  // Lowercase the module path for consistency
  return normalized.toLowerCase();
};

export const getGoMod = async (proxyUrl: string, modulePath: string, release: string): Promise<GoModule[]> => {
  // First check if the module exists by trying to get its release list
  // This helps distinguish between "module not found" and "release not found"
  let moduleExists = false;
  try {
    const versionListData = await fetchFromProxy(proxyUrl, `/${modulePath}/@v/list`);
    const versions = versionListData.split('\n').filter((line: string) => line.trim().length > 0);
    moduleExists = versions.length > 0;
  } catch {
    // If we can't get the version list, the module might not exist
    // Continue to try the .mod file anyway
  }

  try {
    const data = await fetchFromProxy(proxyUrl, `/${modulePath}/@v/${release}.mod`);
    const lines = data.split('\n');
    const deps: GoModule[] = [];
    let inRequire = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('require (')) {
        inRequire = true;
      } else if (trimmed === ')') {
        inRequire = false;
      } else if (inRequire || (trimmed.startsWith('require ') && !trimmed.includes('('))) {
        const match = trimmed.match(/require\s+([^\s]+)\s+(\S+)/);
        if (match) {
          const normalizedPath = normalizeModulePath(match[1]);
          deps.push({ Path: normalizedPath, Version: match[2] });
        } else {
          const parts = trimmed.replace(/require\s+/, '').split(/\s+/);
          if (parts.length >= 1) {
            const normalizedPath = normalizeModulePath(parts[0]);
            deps.push({ Path: normalizedPath, Version: parts[1] });
          }
        }
      }
    }
    return deps;
  } catch (e: any) {
    if (e.message?.includes('Not found')) {
      // If the module exists (we got versions), it's a version not found error
      // Otherwise, it's a module not found error
      if (moduleExists) {
        throw new ReleaseNotFoundError(modulePath, release);
      } else {
        throw new ModuleNotFoundError(modulePath);
      }
    }
    throw new ReleaseNotFoundError(modulePath, release);
  }
};
