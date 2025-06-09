/**
 * dashboardApi.js
 * A dedicated service for fetching all data required for the Admin Dashboard.
 * This centralizes API calls and makes the dashboard component cleaner.
 */
import api from '@/api';

/**
 * Fetches all data needed for the dashboard in parallel.
 * @returns {Promise<Object>} A promise that resolves to an object containing all dashboard data.
 */
export async function fetchDashboardData() {
    try {
        // Use Promise.all to fetch all data concurrently for maximum speed
        const [
            rentalsResponse,
            carsResponse,
            overdueRentalsResponse,
            collectionsDueResponse
        ] = await Promise.all([
            api.get('/api/v1/admin/rentals'),
            api.get('/api/v1/admin/cars'),
            api.get('/api/v1/admin/rentals/overdue'),
            api.get('/api/v1/admin/bookings/collections-due-today') // Assuming this endpoint exists
        ]);

        // Process and structure the data
        const rentals = rentalsResponse.data?.data || [];
        const cars = carsResponse.data?.data || [];
        const overdueRentals = overdueRentalsResponse.data?.data || [];
        const collectionsDueToday = collectionsDueResponse.data?.data || [];

        const activeRentalsCount = rentals.filter(r => r.status === 'ACTIVE').length;
        const availableCarsCount = cars.filter(c => c.available).length;

        // Return a single, well-structured object
        return {
            kpis: {
                activeRentals: activeRentalsCount,
                availableCars: availableCarsCount,
                totalCars: cars.length,
                overdueRentals: overdueRentals.length,
            },
            lists: {
                overdueRentals,
                collectionsDueToday
            },
            chartData: {
                rentals, // Pass the full rentals list to the charts
                cars
            }
        };

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Rethrow the error to be handled by the component
        throw error;
    }
}