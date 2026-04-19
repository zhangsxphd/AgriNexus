import axios from 'axios';

const defaultApiBaseUrl = (() => {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:3001/api';
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3001/api`;
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  timeout: 10000,
});

export default api;
