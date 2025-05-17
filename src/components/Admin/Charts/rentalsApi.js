// rentalsApi.js

import api from "@/api";

let rentalsDataPromise = null;

export function fetchRentalsData() {
    if (rentalsDataPromise) {
        return rentalsDataPromise; // Return the cached promise if it exists
    }

    rentalsDataPromise = new Promise(async (resolve, reject) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
            const response = await api.get('/api/admin/rentals/list/all');

            const data = response.data; // axios directly returns the data in `response.data`
            resolve(data); // Resolve the promise with fetched data

        } catch (error) {
            console.error('Error fetching rentals data:', error);
            reject(error); // Reject the promise with error
        }
    });

    return rentalsDataPromise;
}

// Other functions related to rentals...

export async function fetchRentalById(rentalId) {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/api/admin/rentals/${rentalId}`);
        return response.data; // Return the rental data
    } catch (error) {
        console.error('Error fetching rental by ID:', error);
        throw error; // Throw the error to be handled by the caller
    }
}

export async function createRental(rentalData) {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post('/api/admin/rentals/create', rentalData);
        return response.data; // Return the created rental data
    } catch (error) {
        console.error('Error creating rental:', error);
        throw error; // Throw the error to be handled by the caller
    }
}
