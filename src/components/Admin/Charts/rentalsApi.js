// rentalsApi.js

import axios from "axios";

let rentalsDataPromise = null;
// Add this line to set a default base URL for your API
axios.defaults.baseURL = 'http://localhost:8080';

// Add an interceptor for every request
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
export function fetchRentalsData() {
    if (rentalsDataPromise) {
        return rentalsDataPromise;
    }

    rentalsDataPromise = new Promise(async (resolve, reject) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/rentals/list/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch rentals data');
            }
            const data = await response.json();
            let rentalsData;
            rentalsData = data; // Store the data
            resolve(data);
        } catch (error) {
            console.error('Error fetching rentals data:', error);
            // Handle error case
            reject(error);
        }
    });

    return rentalsDataPromise;
}

// Other functions related to rentals...

export async function fetchRentalById(rentalId) {
    // Implementation for fetching a rental by ID
}

export async function createRental(rentalData) {
    // Implementation for creating a new rental
}

// Other rental-related functions...
