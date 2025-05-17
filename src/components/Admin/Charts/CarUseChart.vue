<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading"> Loading chart...</LoadingModalSection>
    <Doughnut v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>
  </div>
</template>


<script>
import {Chart as ChartJS, ArcElement, CategoryScale, Legend, LinearScale, Title, Tooltip,} from 'chart.js'
import {Bar, Doughnut} from 'vue-chartjs'

import {fetchRentalsData} from "@/components/Admin/Charts/rentalsApi";
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";


ChartJS.register(ArcElement, Title, Tooltip, Legend, CategoryScale, LinearScale)


export default {
  name: 'CarPopularityChart',
  components: {Bar, LoadingModalSection, Doughnut},
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
      },
      isLoading: false,
    };
  },
  async mounted() {
    try {
      this.isLoading = true; // Show loading modal
      const data = await fetchRentalsData();
      if (data) {
        const carPopularity = countCarPopularity(data); // Count car popularity based on the data
        this.chartData = {
          labels: Object.keys(carPopularity), // Car models as labels
          datasets: [
            {
              label: 'Car Popularity',
              data: Object.values(carPopularity), // Popularity values
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(153, 102, 255, 0.6)',
              ], // Custom colors for the pie slices
            },
          ],
        };
      } else {
        // Handle error case
        console.error('Error fetching rentals data');
      }
    } catch (error) {
      console.error('Error fetching rentals data:', error);
      // Handle error case
    } finally {
      this.isLoading = false; // Hide loading modal
    }
  },
};

// Function to count car popularity based on the data
function countCarPopularity(data) {
  const carPopularity = {};
  data.forEach((rental) => {
    const carModel = rental.car.model;
    if (carPopularity[carModel]) {
      carPopularity[carModel]++;
    } else {
      carPopularity[carModel] = 1;
    }
  });
  return carPopularity;
}
</script>
