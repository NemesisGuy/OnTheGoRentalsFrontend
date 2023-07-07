
/*filename: RentalsHistoryChartConfig.js*/
import axios from 'axios';


export async function fetchRentalsHistoryData() {
    try {
        const response = await axios.get('http://localhost:8080/api/admin/rentals/list/all');
        console.log('Response data:', response.data);

        const rentals = response.data;
        console.log('Rentals:', rentals);

        // Count the number of rentals issued on each date
        const rentalCounts = {};
        rentals.forEach((rental) => {
            const issuedDate = rental.issuedDate.split('T')[0]; // Extract date from timestamp
            if (rentalCounts[issuedDate]) {
                rentalCounts[issuedDate]++;
            } else {
                rentalCounts[issuedDate] = 1;
            }
        });

        const labels = Object.keys(rentalCounts);
        console.log('Labels:', labels);

        const data = labels.map((label) => rentalCounts[label]);
        console.log('Data:', data);

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Rentals Issued',
                    backgroundColor: '#f87979',
                    data: data
                }
            ]
        };
    } catch (error) {
        console.error('Error fetching rentals history data:', error);
        return null;
    }
}
