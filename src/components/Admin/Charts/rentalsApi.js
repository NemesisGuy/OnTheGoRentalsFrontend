export async function fetchRentalsData() {
    try {
        const response = await fetch('http://localhost:8080/api/admin/rentals/list/all');
        if (!response.ok) {
            throw new Error('Failed to fetch rentals data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching rentals data:', error);
        // Handle error case
        return undefined;
    }
}
