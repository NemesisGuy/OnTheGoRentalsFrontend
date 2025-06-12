<template>
  <div class="chart-container">
    <!-- The Bar chart component from vue-chartjs -->
    <Bar v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>

    <!-- A more informative message to display if there's no data to show -->
    <div v-if="!isLoading && !chartData" class="no-data">
      <i class="fas fa-car-side"></i>
      <p>No rental data available to determine car popularity.</p>
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
// 1. Import the new datalabels plugin
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 2. Register the datalabels plugin with Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels);

/**
 * CarPopularityChart.vue
 * An improved component that displays a visually-engaging horizontal bar chart
 * of the most rented car models, featuring data labels and dynamic colors.
 */
export default {
  name: 'CarPopularityChart',
  components: {
    Bar,
  },
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
    /**
     * Configuration options for the Chart.js chart.
     * @returns {Object}
     */
    chartOptions() {
      return {
        indexAxis: 'y', // This makes the bar chart horizontal
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 40 // Add padding to the right to ensure data labels are not cut off
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Times Rented',
              font: { size: 14 }
            },
            ticks: {
              stepSize: 1,
              precision: 0,
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Top 10 Most Popular Car Models',
            font: { size: 18 }
          },
          // 3. Configure the datalabels plugin
          datalabels: {
            anchor: 'end',
            align: 'right',
            color: '#444',
            font: {
              weight: 'bold',
            },
            formatter: (value) => value, // Display the raw count
          },
          // 4. Improve the tooltips
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Rented: ${context.raw} times`;
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
      immediate: true, // Process data immediately when the component is created
    }
  },
  methods: {
    /**
     * Generates a palette of visually distinct colors for the chart bars.
     * @param {number} count The number of colors to generate.
     * @returns {string[]} An array of color strings in hex format.
     */
    generateColorPalette(count) {
      const baseColors = [
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
        '#FF9800', '#FF5722', '#795548', '#607D8B', '#9E9E9E'
      ];
      const palette = [];
      for (let i = 0; i < count; i++) {
        palette.push(baseColors[i % baseColors.length]);
      }
      return palette;
    },

    /**
     * Processes the raw rentalsData prop to count the usage of each car model.
     */
    processChartData() {
      this.isLoading = true;

      try {
        const rentals = this.rentalsData;
        if (!rentals || rentals.length === 0) {
          this.chartData = null;
          return;
        }

        // Use reduce for a more concise way to count occurrences
        const popularityCounts = rentals.reduce((acc, rental) => {
          if (rental?.car?.make && rental.car.model) {
            const carName = `${rental.car.make} ${rental.car.model}`;
            acc[carName] = (acc[carName] || 0) + 1;
          }
          return acc;
        }, {});

        // Convert to array, sort by count, and take the top 10
        const sortedPopularity = Object.entries(popularityCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10);

        if (sortedPopularity.length > 0) {
          const labels = sortedPopularity.map(([name]) => name);
          const data = sortedPopularity.map(([, count]) => count);
          const colors = this.generateColorPalette(labels.length);

          this.chartData = {
            labels,
            datasets: [{
              label: 'Number of Rentals',
              backgroundColor: colors,
              borderWidth: 0,
              borderRadius: 4,
              data,
            }],
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