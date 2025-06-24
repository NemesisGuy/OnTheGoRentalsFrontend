/**
 * dashboardApi.js
 * A dedicated service for fetching all data required for the Admin Dashboard.
 * This centralizes API calls, uses specific endpoints for accuracy, and is resilient to partial failures.
 */
import api from '@/api';

/**
 * Fetches all data needed for the dashboard in parallel using Promise.allSettled.
 * This ensures that even if one API call fails, the others can still succeed,
 * preventing a total failure of the dashboard loading process.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing all dashboard data.
 */
export async function fetchDashboardData() {
    console.log("Fetching all dashboard data from dedicated endpoints...");

    // Use Promise.allSettled to ensure all requests complete, regardless of success or failure.
    const results = await Promise.allSettled([
        api.get('/api/v1/admin/rentals/active'),           // Index 0: For KPI
        api.get('/api/v1/admin/cars'),                    // Index 1: For car counts
        api.get('/api/v1/admin/rentals/overdue-rentals'),   // Index 2: For overdue list/KPI
        api.get('/api/v1/admin/bookings/collections-due-today'), // Index 3: For collections list/KPI
        api.get('/api/v1/admin/rentals'),                 // Index 4: For historical chart data
        api.get('/api/v1/admin/data-tools/files/stats'),    // Index 5: For file system stats KPI
        api.get('/api/v1/admin/data-tools/files/usage-chart') // Index 6: For storage usage chart
    ]);

    /**
     * A helper function to safely extract data from a settled promise result.
     * @param {Object} result - The result object from Promise.allSettled.
     * @param {*} [defaultValue=[]] - The value to return if the promise failed or data is invalid.
     * @returns The data from the API response or the default value.
     */
    const getData = (result, defaultValue = []) => {
        if (result.status === 'fulfilled' && result.value.data?.status === 'success') {
            // Handle cases where successful response might have null data (e.g., no content)
            return result.value.data.data === null ? defaultValue : result.value.data.data;
        }
        // Log the reason for failure for debugging purposes.
        console.warn('An API call failed or returned a non-success status:', result.reason || result.value?.data);
        return defaultValue;
    };

    // Safely extract the data from each promise result using the helper.
    const activeRentals = getData(results[0], []);
    const cars = getData(results[1], []);
    const overdueRentals = getData(results[2], []);
    const collectionsDueToday = getData(results[3], []);
    const allRentalsForCharts = getData(results[4], []);
    const fileSystemStats = getData(results[5], { totalFileCount: 0, totalSizeFormatted: '0 B' });
    const storageUsageChartData = getData(results[6], {});

    // This code block will now always execute, even if some promises were rejected.
    const availableCarsCount = cars.filter(c => c.available).length;

    // Construct and return the final, well-structured object for the dashboard component.
    return {
        kpis: {
            activeRentals: activeRentals.length,
            availableCars: availableCarsCount,
            totalCars: cars.length,
            overdueRentals: overdueRentals.length,
            fileSystemStats: fileSystemStats,
        },
        lists: {
            overdueRentals,
            collectionsDueToday
        },
        chartData: {
            rentals: allRentalsForCharts,
            cars: cars,
            storageUsage: storageUsageChartData
        }
    };
    // A top-level try/catch is no longer needed because Promise.allSettled itself does not throw for failed promises.
}