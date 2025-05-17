<template>
  <div class="chart chart-container">
    <LoadingModalSection :show="isLoading"> Loading chart...</LoadingModalSection>
    <Bar v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>
    <div v-if="!isLoading && !chartData" class="no-data">
      No rental data available to display.
    </div>
  </div>
</template>

<script>
import {Bar} from 'vue-chartjs';
import {Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale} from 'chart.js';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
import {fetchRentalsData} from './rentalsApi'; // Assuming this path is correct

Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'RentalsPerDayBarChart', // More descriptive name
  components: {
    Bar,
    LoadingModalSection,
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false, // Often useful for better layout
        scales: { // <-- ADDED/MODIFIED SECTION
          y: {
            beginAtZero: true, // Crucial for bar charts
            title: {
              display: true,
              text: 'Number of Rentals'
            },
            ticks: {
              // Ensure y-axis ticks are integers for counts
              stepSize: 1,
              precision: 0, // No decimal places for counts
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          legend: {
            display: true, // Or false if only one dataset and title is enough
            position: 'top',
          },
          title: {
            display: true,
            text: 'Number of Rentals Per Day'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              }
            }
          }
        }
      },
      isLoading: false,
    };
  },
  async mounted() {
    try {
      this.isLoading = true;
      const rentals = await fetchRentalsData();

      if (rentals && rentals.length > 0) { // Check if rentals is not null and has items
        const rentalCountsByDate = {}; // Object to store rental counts for each date

        rentals.forEach((rental) => {
          if (rental && rental.issuedDate) { // Check if rental and issuedDate exist
            try {
              const issuedDateOnly = rental.issuedDate.split('T')[0];
              if (rentalCountsByDate[issuedDateOnly]) {
                rentalCountsByDate[issuedDateOnly]++;
              } else {
                rentalCountsByDate[issuedDateOnly] = 1;
              }
            } catch (e) {
              console.warn(`Could not parse issuedDate for a rental: ${rental.issuedDate}`, e);
              // Optionally, you could count these under an "Invalid Date" category
            }
          } else {
            console.warn('Rental object or its issuedDate is undefined:', rental);
          }
        });

        // Sort dates for chronological order on the X-axis
        const labels = Object.keys(rentalCountsByDate).sort((a, b) => new Date(a) - new Date(b));

        if (labels.length > 0) {
          this.chartData = {
            labels: labels,
            datasets: [
              {
                label: 'Number of Rentals',
                backgroundColor: '#82C0FF', // A different color for variety
                borderColor: '#4A90E2',
                borderWidth: 1,
                data: labels.map((label) => rentalCountsByDate[label]),
              },
            ],
          };
        } else {
          // This case handles if all rentals had invalid dates
          console.log('No valid rental dates found to plot.');
          this.chartData = null; // Ensure no-data message is shown
        }

      } else {
        console.log('No rentals data found or an empty array was returned.');
        // this.chartData remains null, and the v-if in template will show "No rental data..."
      }
    } catch (error) {
      console.error('Error fetching or processing rentals history data:', error);
      // this.chartData remains null
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped> /* Added scoped to prevent styles from leaking */
.chart-container { /* Renamed for clarity */
  position: relative;
  height: 400px; /* Or any desired height */
  width: 100%;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-style: italic;
}
</style>