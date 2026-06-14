
export const getApiUrl = (path: string) => {
  const isAndroid = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !window.location.port;
  const isCapacitorAndroid = isAndroid || (window as any).Capacitor?.getPlatform() === 'android';

  if (isCapacitorAndroid && import.meta.env.VITE_APP_MODE === 'DEV') {
    return `http://10.0.2.2:3000${path}`;
  }

  if (isCapacitorAndroid && import.meta.env.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL}${path}`;
  }

  return path;
};

// Global storage for the current user's auth context to simplify fetch calls
let currentIdToken: string | null = null;
let currentFirebaseUid: string | null = null;

export const setAuthContext = (token: string | null, uid: string | null) => {
  currentIdToken = token;
  currentFirebaseUid = uid;
};

export const apiFetch = (path: string, options: RequestInit = {}) => {
  const defaultHeaders: any = {
    'Content-Type': 'application/json',
  };

  // Automatically inject Auth headers if they exist
  if (currentIdToken) {
    defaultHeaders['Authorization'] = `Bearer ${currentIdToken}`;
  }
  if (currentFirebaseUid) {
    defaultHeaders['x-firebase-uid'] = currentFirebaseUid;
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};
