// src/api.js
import axios from 'axios';
import router from "@/router";
// import router from '@/router'; // If needed for programmatic navigation

/**
 * @file api.js
 * @description Configures and exports an Axios instance for making API calls.
 * This setup includes dynamic API base URL resolution (runtime via `config.js` or build-time/default)
 * and interceptors for request authorization (adding Bearer token) and response error handling
 * (specifically for 401 errors to attempt token refresh using HttpOnly cookies).
 */

/**
 * Determines the API base URL.
 * It first checks for a runtime configuration (`window.runtimeConfig.API_BASE_URL`)
 * injected by `config.js` (typically in Docker environments). If not found,
 * it falls back to a build-time environment variable (`VITE_BACKEND_API_URL` or `VUE_APP_BACKEND_URL`)
 * or a hardcoded default URL for local development.
 * @returns {string} The resolved API base URL.
 */
const getApiBaseUrl = () => {
    if (window.runtimeConfig && typeof window.runtimeConfig.API_BASE_URL === 'string') {
        console.log("Vue src/api.js: Using runtime API_BASE_URL from config.js:", window.runtimeConfig.API_BASE_URL);

        // Ensure runtime config also has no trailing slash
        return window.runtimeConfig.API_BASE_URL.replace(/\/$/, "");
    }
    const buildTimeApiUrl =
        (typeof import.meta !== 'undefined' ? import.meta.env.VITE_BACKEND_API_URL : process.env.VUE_APP_BACKEND_URL) ||
        'http://localhost:8080/'; // Adjust your dev default
    console.warn("Vue src/api.js: Runtime config not found, using build-time or default fallback API URL:", buildTimeApiUrl);
    // Also ensure build-time config has no trailing slash
    return buildTimeApiUrl.replace(/\/$/, "");
};

/**
 * The API base URL resolved by {@link getApiBaseUrl}.
 * @type {string}
 */
export const resolvedApiBaseUrl = getApiBaseUrl();
console.log("Vue src/api.js: Axios baseURL will be set to:", resolvedApiBaseUrl);

/**
 * The main Axios instance configured for API communication.
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
    baseURL: resolvedApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // IMPORTANT: Send cookies with cross-origin requests for HttpOnly refresh token
});

/**
 * Flag to indicate if a token refresh request is currently in progress.
 * Used to prevent multiple concurrent refresh attempts.
 * @type {boolean}
 */
let isRefreshing = false;
/**
 * Queue to hold requests that failed due to a 401 error while a token refresh is in progress.
 * These requests will be retried or rejected after the refresh attempt completes.
 * @type {Array<Object>}
 * @property {Function} resolve - The resolve function of the promise for the queued request.
 * @property {Function} reject - The reject function of the promise for the queued request.
 */
let failedQueue = [];

/**
 * Processes the queue of failed requests after a token refresh attempt.
 * If the refresh was successful, it resolves the promises with the new token, allowing original requests to be retried.
 * If the refresh failed, it rejects the promises.
 * @param {Error|null} error - The error object if token refresh failed, otherwise null.
 * @param {string|null} token - The new access token if refresh was successful, otherwise null.
 */
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

// Request interceptor
api.interceptors.request.use(
    /**
     * Intercepts outgoing requests to add the Authorization header if an accessToken is available in localStorage.
     * @param {import('axios').AxiosRequestConfig} config - The Axios request configuration.
     * @returns {import('axios').AxiosRequestConfig} The modified request configuration.
     */
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    /**
     * Handles request errors.
     * @param {Error} error - The request error.
     * @returns {Promise<Error>} A promise rejecting with the error.
     */
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    /**
     * Passes through successful responses.
     * @param {import('axios').AxiosResponse} response - The Axios response.
     * @returns {import('axios').AxiosResponse} The response.
     */
    (response) => response,
    /**
     * Handles API response errors, with special logic for 401 Unauthorized errors to attempt token refresh.
     * @async
     * @param {import('axios').AxiosError} error - The Axios error object.
     * @returns {Promise<import('axios').AxiosResponse|Error>} A promise that resolves with the response from a retried request or rejects with an error.
     */
    async (error) => {
        const originalRequest = error.config;
        const refreshUrl = '/api/v1/auth/refresh'; // Relative to baseURL for the refresh endpoint

        // Check if it's a 401 error, not a retry, and not the refresh token URL itself
        if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== refreshUrl) {
            if (isRefreshing) {
                // If a refresh is already in progress, queue the original request
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest); // Retry with new token
                    })
                    .catch(err => Promise.reject(err)); // Propagate error if queued request fails
            }

            originalRequest._retry = true; // Mark that this request has been retried
            isRefreshing = true;

            try {
                console.log('Attempting to refresh token (HttpOnly cookie will be sent by browser)...');
                console.log(`Calling POST to: ${api.defaults.baseURL}${refreshUrl}`);

                // The browser automatically sends the HttpOnly refresh token cookie.
                // No need to send refreshToken in the body for this POST request.
                const refreshResponse = await api.post(refreshUrl, {});

                console.log('Refresh API call successful. Response data:', refreshResponse.data);

                const { accessToken: newAccessToken } = refreshResponse.data.data;

                localStorage.setItem('accessToken', newAccessToken);
                // The new refresh token is set as an HttpOnly cookie by the backend.
                console.log('New access token stored. New refresh token cookie should be set by backend.');

                api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                console.log('Authorization header set for original request. Processing queue...');
                processQueue(null, newAccessToken); // Process queued requests with the new token
                return api(originalRequest); // Retry the original request with the new token

            } catch (refreshError) {
                console.error('!!! Error refreshing token:', refreshError);
                if (refreshError.response) {
                    console.error('Refresh Error Response Data:', refreshError.response.data);
                    console.error('Refresh Error Response Error:', refreshError.response.errors);
                    console.error('Refresh Error Response Status:', refreshError.response.status);
                } else if (refreshError.request) {
                    console.error('Refresh Error: No response received, request was:', refreshError.request);
                } else {
                    console.error('Refresh Error: Error setting up request:', refreshError.message);
                }

                processQueue(refreshError, null); // Reject queued requests as refresh failed
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user'); // Assuming 'user' stores user info

                // Dispatch event for Navbar or other components to update UI regarding auth change
                window.dispatchEvent(new CustomEvent('auth-change'));

                console.log("Redirecting to login because refresh failed.");
                router.push('/nav/user/login'); // Ensure this path is correct for your login route

                return Promise.reject(refreshError); // Reject the error for the original call
            } finally {
                isRefreshing = false;
                console.log('Finished refresh attempt. isRefreshing set to false.');
            }
        }
        // For errors other than 401 or if conditions for refresh are not met
        return Promise.reject(error);
    }
);

export default api;