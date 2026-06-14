
export const getApiUrl = (path: string) => {
  const isAndroid = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !window.location.port;
  const isCapacitorAndroid = isAndroid || (window as any).Capacitor?.getPlatform() === 'android';

  // If we are in development mode on Android, point to the local machine
  if (isCapacitorAndroid && import.meta.env.VITE_APP_MODE === 'DEV') {
    return `http://10.0.2.2:3000${path}`;
  }

  // If we are on mobile (Android/iOS) and have a production backend URL defined, use it
  if (isCapacitorAndroid && import.meta.env.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL}${path}`;
  }

  // For Web (Vercel or localhost), relative paths work best
  return path;
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
