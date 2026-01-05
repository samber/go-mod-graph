// Module size formatting utilities

// Local proxy server URL - configurable via GO_MOD_PROXY_URL environment variable
const LOCAL_PROXY_URL = import.meta.env.GO_MOD_PROXY_URL || 'http://localhost:8080';

// Fetch module size via HEAD request to .zip file
export const getModuleSize = async (
  proxyUrl: string,
  modulePath: string,
  release: string
): Promise<number | null> => {
  try {
    const zipPath = `/${modulePath}/@v/${release}.zip`;
    const url = `${LOCAL_PROXY_URL}/proxy?path=${encodeURIComponent(zipPath)}&proxy=${encodeURIComponent(proxyUrl)}`;

    const response = await fetch(url, {
      method: 'HEAD',
    });

    if (response.status === 404 || !response.ok) {
      return null;
    }

    // Get Content-Length from the response headers
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      return parseInt(contentLength, 10);
    }

    return null;
  } catch (e) {
    // Silently fail if size fetching fails
    return null;
  }
};

// Format bytes to human readable format
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Get background color based on size (green to red gradient)
export const getSizeColor = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);

  if (mb < 1) return '#dcfce7'; // green-100
  if (mb < 5) return '#fef9c3'; // yellow-100
  if (mb < 10) return '#fed7aa'; // orange-100
  if (mb < 25) return '#fecaca'; // red-100
  return '#fca5a5'; // red-200
};

// Get text color based on size (dark greens to dark reds)
export const getSizeTextColor = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);

  if (mb < 1) return '#166534'; // green-700
  if (mb < 5) return '#a16207'; // yellow-700
  if (mb < 10) return '#c2410c'; // orange-700
  if (mb < 25) return '#b91c1c'; // red-700
  return '#991b1b'; // red-800
};
