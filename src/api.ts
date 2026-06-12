
export const getApiUrl = (path: string) => {
  // If running in Capacitor on Android, use the host IP for the Express server
  const isAndroid = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !window.location.port;

  // Use a more robust check for Android environment
  const isCapacitorAndroid = isAndroid || (window as any).Capacitor?.getPlatform() === 'android';

  // To avoid "Mixed Content" errors when the app is served over HTTPS,
  // we should ideally use the same protocol.
  // Capacitor by default uses https://localhost on Android.
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

  // However, local servers usually don't have SSL.
  // Let's force HTTP for the emulator IP if we can, but browsers might still block it.
  // The best fix is to change the androidScheme to 'http' in capacitor.config.ts.
  const baseUrl = isCapacitorAndroid ? `http://10.0.2.2:3000` : '';

  return `${baseUrl}${path}`;
};

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(getApiUrl(path), options);
};
