<template>
  <div class="chart-container">
    <LoadingModalSection v-if="isLoading" show>Loading chart data...</LoadingModalSection>

    <!-- The Bar chart component from vue-chartjs -->
    <Bar v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>

    <!-- A message to display if there's no data to show -->
    <div v-if="!isLoading && !chartData" class="no-data">
      No rental data available to display for this period.
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
// The 'fetchRentalsData' import is no longer needed here as data is passed via props.
// import { fetchRentalsData } from './rentalsApi';

// Register the necessary components for Chart.js
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

/**
 * RentalChart.vue
 * A component that displays a bar chart of the number of rentals per day.
 * This component is now 'dumb' - it receives its data via props from a parent component
 * (like AdminDashboard) and is only responsible for processing and displaying that data.
 */
export default {
  name: 'RentalChart', // Renamed from RentalsPerDayBarChart for consistency with dashboard
  components: {
    Bar,
    LoadingModalSection,
  },
  props: {
    /**
     * The raw array of rental objects fetched from the API.
     * @type {Array}
     */
    rentalsData: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      /**
       * The processed data object formatted for Chart.js.
       * @type {Object|null}
       */
      chartData: null,
      /**
       * Configuration options for the Chart.js chart.
       * @type {Object}
       */
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
              stepSize: 1, // Ensure y-axis only shows whole numbers for counts
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
            display: false, // Hide legend as there's only one dataset
          },
          title: {
            display: true,
            text: 'Daily Rental Volume'
          },
        }
      },
      /**
       * Controls the visibility of the loading overlay.
       * @type {Boolean}
       */
      isLoading: false,
    };
  },
  /**
   * Lifecycle hook that runs when the component is first mounted.
   * Kicks off the initial data processing.
   */
  mounted() {
    this.processChartData();
  },
  /**
   * Watches the 'rentalsData' prop for changes. If the parent component
   * fetches new data, this watcher will trigger a re-processing of the chart.
   */
  watch: {
    rentalsData: {
      handler() {
        this.processChartData();
      },
      deep: true // Watch for changes inside the array
    }
  },
  methods: {
    /**
     * Processes the raw rentalsData prop into a format suitable for the bar chart.
     * It counts the number of rentals for each day.
     */
    processChartData() {
      this.isLoading = true;

      // Use a timeout to ensure the loading animation is visible and UI feels responsive
      setTimeout(() => {
        try {
          const rentals = this.rentalsData;

          if (!rentals || rentals.length === 0) {
            console.log('RentalChart: No data provided to process.');
            this.chartData = null; // Clear chart if no data
            return;
          }

          const rentalCountsByDate = {};

          rentals.forEach((rental) => {
            if (rental && rental.issuedDate) {
              // Extract just the date part (YYYY-MM-DD) from the timestamp
              const issuedDateOnly = rental.issuedDate.split('T')[0];
              if (rentalCountsByDate[issuedDateOnly]) {
                rentalCountsByDate[issuedDateOnly]++;
              } else {
                rentalCountsByDate[issuedDateOnly] = 1;
              }
            }
          });

          // Sort dates chronologically for the X-axis
          const labels = Object.keys(rentalCountsByDate).sort((a, b) => new Date(a) - new Date(b));

          if (labels.length > 0) {
            this.chartData = {
              labels: labels,
              datasets: [
                {
                  label: 'Number of Rentals',
                  backgroundColor: '#82C0FF',
                  borderColor: '#4A90E2',
                  borderWidth: 1,
                  borderRadius: 4,
                  data: labels.map((label) => rentalCountsByDate[label]),
                },
              ],
            };
          } else {
            this.chartData = null;
          }
        } catch (error) {
          console.error('RentalChart: Error processing chart data:', error);
          this.chartData = null;
        } finally {
          this.isLoading = false;
        }
      }, 250); // A small delay for UX
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-style: italic;
  font-size: 1.1rem;
}
</style>