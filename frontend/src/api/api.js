import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send credentials (cookies) with each request
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token if vorhanden in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Check if token expired / unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear local storage and redirect if token is bad
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // We can't use useNavigate here directly, but we can do page redirect if needed,
      // or let AuthContext handle the state shift.
    }
    return Promise.reject(error);
  }
);

export default API;
