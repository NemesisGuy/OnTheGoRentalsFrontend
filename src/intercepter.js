import axios from "axios";

axios.interceptors.request.use(
    (config) => {
        // Log the request headers
        console.log("Axios Request URL:", config.url);
        console.log("Request URL:", config.url);
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