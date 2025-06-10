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
import {fetchRentalsData} from './rentalsApi'; // External data fetching

// Register necessary Chart.js components. This is a side effect of importing this module.
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

/**
 * @file RentalChart.vue
 * @description A component that displays a Bar chart representing the number of rentals per day.
 * It fetches rental data, processes it to aggregate counts by date, and renders the chart
 * using Chart.js and vue-chartjs. Includes loading states and detailed chart configurations.
 * @component RentalsPerDayBarChart
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'RentalsPerDayBarChart',
  components: {
    Bar,
    LoadingModalSection,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} chartData - Data object for the Chart.js Bar chart. Null until data is processed.
   * @property {object} chartOptions - Configuration options for the Bar chart, including scales, legend, title, and tooltips.
   * @property {boolean} isLoading - Flag to control the visibility of the loading indicator.
   */
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Rentals'
            },
            ticks: {
              stepSize: 1,
              precision: 0,
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
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Number of Rentals Per Day'
          },
          tooltip: { // Custom tooltip formatting
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
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches and processes rental data to render the bar chart.
   * @async
   * @returns {void}
   */
  async mounted() {
    try {
      this.isLoading = true;
      const rentals = await fetchRentalsData(); // External API call

      if (rentals && rentals.length > 0) {
        const rentalCountsByDate = {};

        rentals.forEach((rental) => {
          if (rental && rental.issuedDate) {
            try {
              const issuedDateOnly = rental.issuedDate.split('T')[0]; // Extract YYYY-MM-DD
              if (rentalCountsByDate[issuedDateOnly]) {
                rentalCountsByDate[issuedDateOnly]++;
              } else {
                rentalCountsByDate[issuedDateOnly] = 1;
              }
            } catch (e) {
              console.warn(`RentalChart: Could not parse issuedDate for a rental: ${rental.issuedDate}`, e);
            }
          } else {
            console.warn('RentalChart: Rental object or its issuedDate is undefined:', rental);
          }
        });

        const labels = Object.keys(rentalCountsByDate).sort((a, b) => new Date(a) - new Date(b)); // Sort dates

        if (labels.length > 0) {
          this.chartData = {
            labels: labels,
            datasets: [
              {
                label: 'Number of Rentals',
                backgroundColor: '#82C0FF',
                borderColor: '#4A90E2',
                borderWidth: 1,
                data: labels.map((label) => rentalCountsByDate[label]),
              },
            ],
          };
        } else {
          console.log('RentalChart: No valid rental dates found to plot.');
          this.chartData = { labels: [], datasets: [] }; // Ensure chart renders empty if no valid data
        }

      } else {
        console.log('RentalChart: No rentals data found or an empty array was returned.');
        this.chartData = { labels: [], datasets: [] }; // Ensure chartData is not null
      }
    } catch (error) {
      console.error('RentalChart: Error fetching or processing rentals history data for chart:', error);
      this.chartData = { labels: [], datasets: [] }; // Ensure chartData is not null
      // Optionally, display an error message to the user via a modal or on-page text
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