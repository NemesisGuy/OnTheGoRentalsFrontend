// src/api.js
import axios from 'axios';
import router from "@/router";
// import router from '@/router'; // If needed for programmatic navigation

const getApiBaseUrl = () => {
    if (window.runtimeConfig && typeof window.runtimeConfig.API_BASE_URL === 'string') {
        console.log("Vue src/api.js: Using runtime API_BASE_URL from config.js:", window.runtimeConfig.API_BASE_URL);
        return window.runtimeConfig.API_BASE_URL;
    }
    const buildTimeApiUrl =
        (typeof import.meta !== 'undefined' ? import.meta.env.VITE_BACKEND_API_URL : process.env.VUE_APP_BACKEND_URL) ||
        'http://localhost:8080/'; // Adjust your dev default
    console.warn("Vue src/api.js: Runtime config not found, using build-time or default fallback API URL:", buildTimeApiUrl);
    return buildTimeApiUrl;
};

const resolvedApiBaseUrl = getApiBaseUrl();
console.log("Vue src/api.js: Axios baseURL will be set to:", resolvedApiBaseUrl);

const api = axios.create({
    baseURL: resolvedApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // <<<< IMPORTANT: Send cookies with cross-origin requests
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshUrl = '/api/v1/auth/refresh'; // Relative to baseURL

        if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== refreshUrl) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // No longer get refresh token from localStorage
            // const refreshTokenString = localStorage.getItem('refreshToken');
            // if (!refreshTokenString) { ... } // This check is no longer needed here for the token itself

            try {
                console.log('Attempting to refresh token (cookie will be sent by browser)...');
                console.log(`Calling POST to: ${api.defaults.baseURL}${refreshUrl}`); // Log the exact URL

                // The browser will automatically send the HttpOnly refresh token cookie
                // No need to send refreshToken in the body for this POST request
                const refreshResponse = await api.post(refreshUrl, {}); // Empty body, or specific DTO if backend expects one (but it shouldn't now)

                console.log('Refresh API call successful. Response data:', refreshResponse.data);

                const { accessToken: newAccessToken /*, refreshToken: newRotatedRefreshToken - no longer in body */ } = refreshResponse.data.data;

                localStorage.setItem('accessToken', newAccessToken);
                // No need to store new refresh token from response body, it's set as a new cookie by the backend.
                console.log('New access token stored. New refresh token cookie should be set by backend.');


                api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                console.log('Authorization header set for original request. Processing queue...');
                processQueue(null, newAccessToken);
                return api(originalRequest);

            } catch (refreshError) {
                console.error('!!! Error refreshing token:', refreshError);
                if (refreshError.response) {
                    console.error('Refresh Error Response Data:', refreshError.response.data);
                    console.error('Refresh Error Response Error:', refreshError.response.errors);
                    console.error('Refresh Error Response Status:', refreshError.response.status);
                    // If refresh fails (e.g., cookie expired or invalid), backend might return 401/403
                    // This usually means user needs to log in again.
                } else if (refreshError.request) {
                    console.error('Refresh Error: No response received, request was:', refreshError.request);
                } else {
                    console.error('Refresh Error: Error setting up request:', refreshError.message);
                }

                processQueue(refreshError, null);// Reject any other pending requests
                localStorage.removeItem('accessToken');
                // No refreshToken in localStorage to remove
                localStorage.removeItem('user');
                // Dispatch event for Navbar or other components to update UI
                window.dispatchEvent(new CustomEvent('auth-change'));

                console.log("Redirecting to login because refresh failed.");
                router.push('/nav/user/login'); // <<<< UNCOMMENT AND ENSURE THIS PATH IS CORRECT

                // Optional: Show a message to the user
                // alert('Your session has expired or you have been logged out. Please log in again.');

                return Promise.reject(refreshError); // Reject the error for the original call
            } finally {
                isRefreshing = false;
                console.log('Finished refresh attempt. isRefreshing set to false.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;