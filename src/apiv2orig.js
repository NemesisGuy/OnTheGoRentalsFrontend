import axios from 'axios';
import process from "process";

const api = axios.create({
    baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8080', // Adjust as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🔐 Add Authorization token to every request if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // Log the request headers
           // console.log("Axios Request URL intercepted: ", config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🚨 Optionally handle responses globally (e.g., auto logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // e.g., redirect to login page or clear auth
            console.warn('Unauthorized. Consider redirecting to login.');
        }
        return Promise.reject(error);
    }
);

export default api;
