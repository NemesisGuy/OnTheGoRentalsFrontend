// src/api.js

import axios from 'axios';

// Use the backend URL from the environment variables
const backendUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:8080";  // Fallback if undefined
console.log('API URL:', backendUrl);  // Log the API URL being used

const api = axios.create({
    baseURL: backendUrl,
});

api.interceptors.request.use(
    (config) => {
        // Log the request details
        console.log("Axios Request URL:", config.url);
        console.log("Request Method:", config.method);
        console.log("Request Headers:", config.headers);
        console.log("Request Data:", config.data); // Log request data if applicable
        return config; // Always return the config
    },
    (error) => {
        // Handle request error
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

export default api;
