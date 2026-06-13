
export const getApiUrl = (path: string) => {
  // If running in Capacitor on Android, use the host IP for the Express server
  const isAndroid = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !window.location.port;

  // Use a more robust check for Android environment
  const isCapacitorAndroid = isAndroid || (window as any).Capacitor?.getPlatform() === 'android';

  const baseUrl = isCapacitorAndroid ? `http://10.0.2.2:3000` : '';
  return `${baseUrl}${path}`;
};

export const apiFetch = (path: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  return fetch(getApiUrl(path), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};
