<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading">Loading chart...</LoadingModalSection>
    <Line v-if="!isLoading && chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
import { fetchRentalsData } from './rentalsApi';

Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default {
  name: 'RentalDurations',
  components: {
    Line,
    LoadingModalSection,
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        elements: {
          point: {
            radius: 4,
            borderWidth: 1,
            borderColor: '#f87979',
            pointStyle: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value === 'N/A' ? 'rectRot' : 'circle';
            },
          },
        },
      },
      isLoading: false,
    };
  },
  async mounted() {
    try {
      this.isLoading = true; // Show loading modal
      const rentals = await fetchRentalsData();
      if (rentals && rentals.length > 0) { // Check if rentals data is not null and has at least one item
        const rentalDurations = {}; // Object to store rental durations for each date
        rentals.forEach((rental) => {
          const issuedDate = rental.issuedDate ? rental.issuedDate.split('T')[0] : null; // Extract date from timestamp
          const returnedDate = rental.returnedDate ? rental.returnedDate.split('T')[0] : null; // Extract date from timestamp
          if (issuedDate) { // Check if issuedDate is not null
            let duration;
            if (returnedDate) {
              duration = Math.floor((Date.parse(returnedDate) - Date.parse(issuedDate)) / (1000 * 60 * 60 * 24)); // Calculate duration in days
            } else {
              duration = 'N/A'; // Set 'N/A' if returnedDate is null
            }
            if (rentalDurations[issuedDate]) {
              rentalDurations[issuedDate].push(duration);
            } else {
              rentalDurations[issuedDate] = [duration];
            }
          }
        });

        const labels = Object.keys(rentalDurations);
        const dataset = labels.map((label) => {
          const durations = rentalDurations[label];
          const sum = durations.reduce((total, duration) => total + duration, 0);
          const average = Math.round(sum / durations.length);
          return average;
        });

        const chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Rental Durations',
              backgroundColor: '#f87979',
              borderColor: '#f87979',
              data: dataset,
              fill: false,
            },
          ],
        };
        this.chartData = chartData;
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
</script>

<style>
</style>
