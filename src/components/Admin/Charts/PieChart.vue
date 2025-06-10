<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading">Loading chart...</LoadingModalSection>
    <Pie v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>

  </div>
</template>

<script>
// import {Doughnut} from 'vue-chartjs'; // Doughnut is unused, Pie is used.
import {Pie} from 'vue-chartjs';
import {fetchRentalsData} from './rentalsApi'; // External data fetching
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
// import {PriceGroup} from '@/enums/PriceGroup'; // Imported but not actively used in this script's logic

// Note: Chart.js elements like ArcElement, Tooltip, Legend are not explicitly registered here.
// They might be registered globally or by another chart component. If issues arise, explicit registration may be needed:
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Counts the distribution of rentals across different car price groups.
 * @param {Array<object>} data - An array of rental objects. Each rental is expected to have a `car.priceGroup` property.
 * @returns {object} An object where keys are price group strings and values are their counts.
 */
function countPriceGroupDistribution(data) {
  const priceGroupDistribution = {};
  if (!Array.isArray(data)) {
    console.error("countPriceGroupDistribution: Input data is not an array.", data);
    return priceGroupDistribution;
  }
  data.forEach((rental) => {
    if (rental && rental.car && typeof rental.car.priceGroup === 'string') {
      const priceGroup = rental.car.priceGroup;
      if (priceGroupDistribution[priceGroup]) {
        priceGroupDistribution[priceGroup]++;
      } else {
        priceGroupDistribution[priceGroup] = 1;
      }
    } else {
      console.warn("countPriceGroupDistribution: Skipping rental with invalid car or priceGroup data.", rental);
    }
  });
  return priceGroupDistribution;
}

/**
 * Returns a background color string from a predefined palette based on an index.
 * Used for styling pie chart segments.
 * @param {number} index - The index to pick a color from the palette.
 * @returns {string} A color string in 'rgba(r, g, b, a)' format.
 */
function getBackgroundColor(index) {
  const colors = [
    'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
    'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
    'rgba(201, 203, 207, 0.6)', // Added grey
    'rgba(75, 192, 100, 0.6)',  // Added a green variant
    'rgba(192, 75, 192, 0.6)', // Added a purple variant
    'rgba(192, 192, 75, 0.6)', // Added a yellow-green variant
  ];
  return colors[index % colors.length]; // Use modulo to cycle through colors if more items than colors
}

/**
 * @file PieChart.vue
 * @description A component that displays a Pie chart representing the distribution of rentals
 * across different car price groups. It fetches rental data, processes it to count
 * price group occurrences, and renders the chart.
 * @component PriceGroupPieChart
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'PriceGroupPieChart', // Renamed from RentalsDistributionChart for clarity based on filename
  components: {
    Pie,
    LoadingModalSection,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} chartData - Data object for the Chart.js Pie chart. Null until data is processed.
   * @property {object} chartOptions - Configuration options for the Pie chart.
   * @property {boolean} isLoading - Flag to control the loading indicator.
   */
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { // Added common plugins like title and legend
          title: {
            display: true,
            text: 'Rental Distribution by Car Price Group'
          },
          legend: {
            position: 'top', // Example legend position
          }
        }
      },
      isLoading: false,
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches and processes data to render the pie chart.
   * @async
   * @returns {void}
   */
  async mounted() {
    try {
      this.isLoading = true;
      const rentalsData = await fetchRentalsData(); // External API call
      console.log('PieChart - Rentals Data:', rentalsData);

      if (rentalsData && rentalsData.length > 0) {
        const priceGroupDistribution = countPriceGroupDistribution(rentalsData);
        console.log('PieChart - Price Group Distribution:', priceGroupDistribution);

        const priceGroups = Object.keys(priceGroupDistribution);
        const backgroundColors = priceGroups.map((_, index) => getBackgroundColor(index)); // Use index for color mapping

        this.chartData = {
          labels: priceGroups,
          datasets: [
            {
              label: 'Number of Rentals', // More specific label
              data: Object.values(priceGroupDistribution),
              backgroundColor: backgroundColors,
            },
          ],
        };
      } else {
        console.error('PieChart: Error fetching rentals data or data is empty. Cannot generate chart.');
        // Optionally set chartData to an empty state or show an error in template
        this.chartData = { labels: [], datasets: [] }; // Ensure chartData is not null for graceful render
      }
    } catch (error) {
      console.error('PieChart: Error fetching or processing rentals data for chart:', error);
      this.chartData = { labels: [], datasets: [] }; // Ensure chartData is not null
      // Optionally, display an error message to the user
    } finally {
      this.isLoading = false;
    }
  },
};
</script>
