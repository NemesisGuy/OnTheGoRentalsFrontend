/**
 * dashboardApi.js
 * A dedicated service for fetching all data required for the Admin Dashboard.
 * This centralizes API calls and makes the dashboard component cleaner.
 * It now uses specific, pre-filtered backend endpoints for accuracy and performance.
 */
import api from '@/api';

/**
 * Fetches all data needed for the dashboard in parallel.
 * @returns {Promise<Object>} A promise that resolves to an object containing all dashboard data.
 */
export async function fetchDashboardData() {
    console.log("Fetching all dashboard data from dedicated endpoints...");
    try {
        // Use Promise.all to fetch all data concurrently for maximum speed.
        // **MODIFIED**: Swapped general endpoints for specific, performant ones.
        const [
            activeRentalsResponse, // <-- Uses the correct endpoint
            carsResponse,
            overdueRentalsResponse,
            collectionsDueResponse,
            allRentalsForChartsResponse, // <-- New call for chart data
        ] = await Promise.all([
            api.get('/api/v1/admin/rentals/active'),         // <-- For the KPI
            api.get('/api/v1/admin/cars'),                  // For car counts
            api.get('/api/v1/admin/rentals/overdue-rentals'), // For overdue list/KPI
            api.get('/api/v1/admin/bookings/collections-due-today'), // For collections list/KPI
            api.get('/api/v1/admin/rentals'),               // For historical chart data
        ]);

        // Process and structure the data
        const activeRentals = activeRentalsResponse.data?.data || [];
        const cars = carsResponse.data?.data || [];
        const overdueRentals = overdueRentalsResponse.data?.data || [];
        const collectionsDueToday = collectionsDueResponse.data?.data || [];
        const allRentalsForCharts = allRentalsForChartsResponse.data?.data || [];

        const availableCarsCount = cars.filter(c => c.available).length;

        // **THE FIX**: The KPI count is now the direct length of the response from the /active endpoint.
        // This guarantees it will match the ActiveRentalsManagement page.
        const activeRentalsCount = activeRentals.length;

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
                rentals: allRentalsForCharts, // Pass the full rentals list to the charts
                cars
            }
        };

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Rethrow the error to be handled by the component
        throw new Error("Failed to load critical dashboard data. Please try again.");
    }
}