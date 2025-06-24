<template>
  <div class="chart-container">
    <!-- The Bar chart component from vue-chartjs -->
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />

    <!-- A message to display if there's no data -->
    <div v-if="!chartData" class="no-data">
      <i class="fas fa-hdd"></i>
      <p>No storage usage data to display.</p>
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels);

/**
 * StorageUsageChart.vue
 * Displays a bar chart showing storage usage by folder.
 */
export default {
  name: 'StorageUsageChart',
  components: { Bar },
  props: {
    storageData: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    /**
     * The processed data object formatted for Chart.js.
     * This is a computed property, so it automatically updates when `storageData` changes.
     * @returns {Object|null}
     */
    chartData() {
      if (!this.storageData || Object.keys(this.storageData).length === 0) {
        return null;
      }

      const labels = Object.keys(this.storageData);
      const dataInMB = labels.map(label => (this.storageData[label] / (1024 * 1024)));
      const colors = this.generateColorPalette(labels.length);

      return {
        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          label: 'Storage Usage (MB)',
          backgroundColor: colors,
          borderRadius: 4,
          data: dataInMB
        }]
      };
    },
    /**
     * Configuration options for the Chart.js chart.
     * @returns {Object}
     */
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Storage Usage by Folder',
            font: { size: 18 }
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#555',
            font: { weight: 'bold' },
            formatter: (value) => `${value.toFixed(1)} MB`, // Format to one decimal place
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Usage: ${context.raw.toFixed(2)} MB`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value} MB`
            }
          }
        }
      };
    }
  },
  methods: {
    /**
     * Generates a palette of visually distinct colors for the chart bars.
     * @param {number} count The number of colors to generate.
     * @returns {string[]} An array of color strings in hex format.
     */
    generateColorPalette(count) {
      const baseColors = ['#42A5F5', '#66BB6A', '#FFA726', '#26A69A', '#AB47BC', '#EF5350'];
      const palette = [];
      for (let i = 0; i < count; i++) {
        palette.push(baseColors[i % baseColors.length]);
      }
      return palette;
    },
  }
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