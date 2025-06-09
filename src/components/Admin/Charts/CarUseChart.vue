<template>
  <div class="chart-container">
    <LoadingModalSection v-if="isLoading" show>Analyzing popularity...</LoadingModalSection>

    <!-- The Doughnut chart component from vue-chartjs -->
    <Doughnut v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>

    <!-- A message to display if there's no data -->
    <div v-if="!isLoading && !chartData" class="no-data">
      No rental data available to determine car popularity.
    </div>
  </div>
</template>

<script>
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
// The 'fetchRentalsData' import is removed as data is now passed via props.

ChartJS.register(ArcElement, Title, Tooltip, Legend);

/**
 * CarPopularityChart.vue
 * Displays a doughnut chart showing the popularity of car models based on rental frequency.
 * This component receives its data via props and does not perform its own API calls.
 */
export default {
  name: 'CarPopularityChart',
  components: { Doughnut, LoadingModalSection },
  props: {
    /**
     * The raw array of rental objects passed from the parent dashboard component.
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
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Car Model Rental Frequency'
          }
        }
      },
      isLoading: false,
    };
  },
  mounted() {
    this.processChartData();
  },
  watch: {
    rentalsData: {
      handler() {
        this.processChartData();
      },
      deep: true
    }
  },
  methods: {
    /**
     * Processes the raw rentalsData prop to count the popularity of each car model.
     */
    processChartData() {
      this.isLoading = true;
      setTimeout(() => {
        try {
          const rentals = this.rentalsData;

          if (!rentals || rentals.length === 0) {
            this.chartData = null;
            return;
          }

          const carPopularity = {};
          rentals.forEach((rental) => {
            if (rental && rental.car && rental.car.model) {
              const carModel = rental.car.model;
              carPopularity[carModel] = (carPopularity[carModel] || 0) + 1;
            }
          });

          const labels = Object.keys(carPopularity);
          const data = Object.values(carPopularity);

          if (labels.length > 0) {
            this.chartData = {
              labels: labels,
              datasets: [
                {
                  label: 'Number of Rentals',
                  data: data,
                  backgroundColor: [ // A vibrant, larger color palette
                    '#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#BD10E0',
                    '#9013FE', '#B8E986', '#7ED321', '#E84C3D', '#2D3B45'
                  ],
                  hoverOffset: 4
                },
              ],
            };
          } else {
            this.chartData = null;
          }
        } catch (error) {
          console.error('CarPopularityChart: Error processing chart data:', error);
          this.chartData = null;
        } finally {
          this.isLoading = false;
        }
      }, 250);
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
}
</style>