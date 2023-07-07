<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading"> Loading chart... </LoadingModalSection>
    <Bar v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>


  </div>
</template>

<script>
import {Bar} from 'vue-chartjs';
import {Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale} from 'chart.js';
import {fetchRentalsHistoryData} from './RentalsHistoryChartConfig';
import LoadingModalSection   from "@/components/Main/Modals/LoadingModalSection.vue";

Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: {
    Bar,
    LoadingModalSection,
  },
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
      const data = await fetchRentalsHistoryData();
      if (data) {
        this.chartData = data;
      } else {
        // Handle error case
        console.error('Error fetching rentals history data');
      }
    } catch (error) {
      console.error('Error fetching rentals history data:', error);
      // Handle error case
    } finally {
      this.isLoading = false; // Hide loading modal
    }
  },
};
</script>
<style>

</style>
