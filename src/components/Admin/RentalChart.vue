<template>
  <div class="chart">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions"/>
    <div v-else>Loading chart...</div>
  </div>
</template>

<script>

import {Bar} from 'vue-chartjs'
import {Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale} from 'chart.js'
import {fetchRentalsHistoryData} from './RentalsHistoryChartConfig'
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: {Bar},
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true
      }
    }
  },
  async mounted() {
    try {
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
    }
  }
}
</script>