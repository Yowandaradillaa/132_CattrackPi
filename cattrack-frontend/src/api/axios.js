import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api', // Pastikan ini port 3000
});

// Sisanya biarkan tetap sama
instance.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

export default instance;