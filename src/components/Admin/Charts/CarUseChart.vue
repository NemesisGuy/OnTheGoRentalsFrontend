<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading"> Loading chart...</LoadingModalSection>
    <Doughnut v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>
  </div>
</template>


<script>
import {Chart as ChartJS, ArcElement, CategoryScale, Legend, LinearScale, Title, Tooltip} from 'chart.js'
// import {Bar, Doughnut} from 'vue-chartjs' // Bar is unused
import { Doughnut } from 'vue-chartjs' // Only import Doughnut

import {fetchRentalsData} from "@/components/Admin/Charts/rentalsApi"; // External data fetching
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";

// Register necessary Chart.js components. This is a side effect of importing this module.
ChartJS.register(ArcElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

/**
 * Counts the popularity of each car model from a list of rental data.
 * @param {Array<object>} data - An array of rental objects, where each rental is expected to have a `car.model` property.
 * @returns {object} An object where keys are car models (string) and values are their counts (number).
 */
function countCarPopularity(data) {
  const carPopularity = {};
  if (!Array.isArray(data)) { // Basic validation
    console.error("countCarPopularity: Input data is not an array.", data);
    return carPopularity;
  }
  data.forEach((rental) => {
    if (rental && rental.car && typeof rental.car.model === 'string') {
      const carModel = rental.car.model;
      if (carPopularity[carModel]) {
        carPopularity[carModel]++;
      } else {
        carPopularity[carModel] = 1;
      }
    } else {
      console.warn("countCarPopularity: Skipping rental with invalid car data.", rental);
    }
  });
  return carPopularity;
}

/**
 * @file CarUseChart.vue
 * @description A component that displays a Doughnut chart representing car popularity based on rental data.
 * It fetches rental data using an external API call, processes it to count car model occurrences,
 * and then renders the chart using Chart.js and vue-chartjs.
 * @component CarUseChart
 */
export default {
  /**
   * The registered name of the component. Consistent with filename.
   * @type {string}
   */
  name: 'CarUseChart', // Changed from CarPopularityChart for consistency
  components: {
    // Bar, // Removed unused Bar chart component
    LoadingModalSection,
    Doughnut
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} chartData - The data object formatted for Chart.js Doughnut chart. Null until data is fetched and processed.
   * @property {object} chartOptions - Configuration options for the Chart.js Doughnut chart.
   * @property {boolean} isLoading - Flag to control the visibility of the loading indicator.
   */
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true, // Default is true, can be false if specific sizing is needed
        plugins: { // Example of adding a title, common for charts
          title: {
            display: true,
            text: 'Car Model Popularity (Based on Rentals)'
          }
        }
      },
      isLoading: false,
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Initiates the fetching and processing of data to render the chart.
   * @async
   * @returns {void}
   */
  async mounted() {
    try {
      this.isLoading = true;
      const data = await fetchRentalsData(); // External API call
      if (data) {
        const carPopularity = countCarPopularity(data);

        const backgroundColors = Object.keys(carPopularity).map((_, index) => {
          // Generate distinct colors or use a predefined palette
          const colors = [
            'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)',
            'rgba(102, 255, 83, 0.6)', 'rgba(255, 83, 102, 0.6)'
          ];
          return colors[index % colors.length];
        });

        this.chartData = {
          labels: Object.keys(carPopularity),
          datasets: [
            {
              label: 'Number of Rentals', // Changed label for clarity
              data: Object.values(carPopularity),
              backgroundColor: backgroundColors,
            },
          ],
        };
      } else {
        console.error('CarUseChart: Error or no data received from fetchRentalsData.');
        // Optionally, set chartData to an empty state or show an error message in the template
      }
    } catch (error) {
      console.error('CarUseChart: Error fetching or processing rentals data for chart:', error);
      // Optionally, display an error message to the user via a modal or on-page text
    } finally {
      this.isLoading = false;
    }
  },
};
</script>
