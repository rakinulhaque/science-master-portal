// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
  timeout: 10000, // 10 seconds
};

export default API_CONFIG;
