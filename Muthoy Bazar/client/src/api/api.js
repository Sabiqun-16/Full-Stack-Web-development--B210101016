import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach the JWT (kept in memory + sessionStorage-free by design; we read it
// from localStorage only because JWT auth is inherently stored client-side).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('mb_token');
      localStorage.removeItem('mb_user');
    }
    return Promise.reject(err);
  }
);

export default api;
