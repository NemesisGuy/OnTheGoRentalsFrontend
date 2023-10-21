// rentalsApi.js

let rentalsDataPromise = null;

export function fetchRentalsData() {
    if (rentalsDataPromise) {
        return rentalsDataPromise;
    }

    rentalsDataPromise = new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/rentals/list/all');
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
