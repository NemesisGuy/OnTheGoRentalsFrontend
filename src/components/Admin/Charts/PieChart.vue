<template>
  <div class="chart-container">
    <!-- The Pie component from vue-chartjs -->
    <Pie v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>

    <!-- A more informative message to display if there's no data -->
    <div v-if="!isLoading && !chartData" class="no-data">
      <i class="fas fa-dollar-sign"></i>
      <p>No rental data available for price group analysis.</p>
    </div>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the necessary Chart.js components and the datalabels plugin
ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels);

/**
 * PieChart.vue
 * Displays a pie chart showing the distribution of rentals across different price groups.
 */
export default {
  name: 'PieChart',
  components: {
    Pie,
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
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top', // Position legend at the top
          },
          title: {
            display: true,
            text: 'Rental Distribution by Price Group',
            font: { size: 18 }
          },
          // Configure datalabels to show percentages
          datalabels: {
            color: '#fff', // White text for better contrast on colored backgrounds
            font: {
              weight: 'bold',
            },
            // Calculate and format the percentage
            formatter: (value, ctx) => {
              const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = (value * 100 / sum).toFixed(0) + '%';
              // Only show the percentage if it's large enough to be readable
              return sum > 0 && (value * 100 / sum) > 5 ? percentage : '';
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
     * Defines a consistent color for each price group.
     * @param {string} groupName The name of the price group.
     * @returns {string} A hex color code.
     */
    getColorForGroup(groupName) {
      const colorMap = {
        'ECONOMY': '#4CAF50',
        'STANDARD': '#2196F3',
        'LUXURY': '#FFC107',
        'PREMIUM': '#9C27B0',
        'EXOTIC': '#E91E63',
        'SPECIAL': '#FF5722',
        'default': '#9E9E9E'
      };
      return colorMap[groupName.toUpperCase()] || colorMap['default'];
    },

    /**
     * Processes the raw rentalsData prop to count rentals per price group.
     */
    processChartData() {
      this.isLoading = true;
      try {
        const rentals = this.rentalsData;
        if (!rentals || rentals.length === 0) {
          this.chartData = null;
          return;
        }

        const distribution = rentals.reduce((acc, rental) => {
          if (rental?.car?.priceGroup) {
            const group = rental.car.priceGroup;
            acc[group] = (acc[group] || 0) + 1;
          }
          return acc;
        }, {});

        const labels = Object.keys(distribution);
        const data = Object.values(distribution);

        if (labels.length > 0) {
          this.chartData = {
            labels,
            datasets: [{
              label: 'Rentals',
              data,
              backgroundColor: labels.map(label => this.getColorForGroup(label)),
              borderColor: '#fff',
              borderWidth: 2,
              hoverOffset: 8,
            }],
          };
        } else {
          this.chartData = null;
        }
      } catch (error) {
        console.error('PieChart: Error processing chart data:', error);
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