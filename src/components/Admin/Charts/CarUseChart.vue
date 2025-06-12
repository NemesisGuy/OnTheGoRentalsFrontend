<template>
  <div class="chart-container">
    <!-- The Doughnut chart component from vue-chartjs -->
    <Doughnut v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>

    <!-- A message to display if there's no data -->
    <div v-if="!isLoading && !chartData" class="no-data">
      <i class="fas fa-chart-pie"></i>
      <p>No rental data available to show model frequency.</p>
    </div>
  </div>
</template>

<script>
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels);

/**
 * CarModelDoughnutChart.vue
 * Displays a doughnut chart showing the rental frequency of the top car models,
 * grouping less frequent models into an "Other" category.
 */
export default {
  name: 'CarModelDoughnutChart',
  components: { Doughnut },
  props: {
    rentalsData: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      chartData: null,
      isLoading: true,
    };
  },
  computed: {
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Car Model Rental Frequency',
            font: { size: 18 }
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold',
            },
            formatter: (value, ctx) => {
              const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = (value * 100 / sum).toFixed(0) + '%';
              return (value * 100 / sum) > 3 ? percentage : ''; // Only show for slices > 3%
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = (value * 100 / sum).toFixed(1) + '%';
                return `${label}: ${value} rentals (${percentage})`;
              }
            }
          }
        }
      };
    },
  },
  watch: {
    rentalsData: {
      handler() {
        this.processChartData();
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /**
     * Processes the raw rentalsData prop to count the popularity of each car model.
     * It groups less popular models into an "Other" category for clarity.
     */
    processChartData() {
      this.isLoading = true;
      try {
        const rentals = this.rentalsData;
        if (!rentals || rentals.length === 0) {
          this.chartData = null;
          return;
        }

        const popularityCounts = rentals.reduce((acc, rental) => {
          if (rental?.car?.model) {
            const model = rental.car.model;
            acc[model] = (acc[model] || 0) + 1;
          }
          return acc;
        }, {});

        const sorted = Object.entries(popularityCounts).sort(([, a], [, b]) => b - a);

        // Keep the top 6, group the rest into "Other"
        const topN = 6;
        const main = sorted.slice(0, topN);
        const other = sorted.slice(topN);

        const finalCounts = Object.fromEntries(main);
        if (other.length > 0) {
          finalCounts['Other'] = other.reduce((sum, [, count]) => sum + count, 0);
        }

        const labels = Object.keys(finalCounts);
        const data = Object.values(finalCounts);

        if (labels.length > 0) {
          this.chartData = {
            labels: labels,
            datasets: [{
              label: 'Rentals',
              data: data,
              backgroundColor: [
                '#4A90E2', '#50E3C2', '#F5A623', '#9013FE',
                '#BD10E0', '#7ED321', '#B8E986', '#4A4A4A'
              ],
              hoverOffset: 8
            }],
          };
        } else {
          this.chartData = null;
        }
      } catch (error) {
        console.error('CarModelDoughnutChart: Error processing chart data:', error);
        this.chartData = null;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}
.no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  text-align: center;
}
.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.no-data p {
  font-style: italic;
  font-size: 1.1rem;
  margin: 0;
}
</style>