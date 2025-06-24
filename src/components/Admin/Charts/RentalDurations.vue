<template>
  <div class="chart-container">
    <!-- The Line chart component from vue-chartjs -->
    <Line v-if="!isLoading && chartData" :data="chartData" :options="chartOptions" />

    <!-- A more informative message to display if there's no data -->
    <div v-if="!isLoading && !chartData" class="no-data">
      <i class="fas fa-calendar-alt"></i>
      <p>No completed rental data available to analyze durations.</p>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler, ChartDataLabels);

export default {
  name: 'RentalDurations',
  components: { Line },
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
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Duration (Days)',
              font: { size: 14 }
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Average Rental Duration by Month',
            font: { size: 18 }
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#555',
            font: {
              weight: 'bold',
            },
            formatter: (value) => value.toFixed(1),
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Avg. Duration: ${context.raw.toFixed(1)} days`;
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
    processChartData() {
      this.isLoading = true;
      try {
        console.log('[RentalDurations] Received rentalsData:', this.rentalsData); // DEBUG: See what data is coming in

        // THE FIX: 1. Explicitly filter for completed rentals first.
        const completedRentals = this.rentalsData.filter(
            rental => rental && rental.issuedDate && rental.returnedDate
        );

        console.log(`[RentalDurations] Found ${completedRentals.length} completed rentals to process.`); // DEBUG: Check how many rentals are valid

        if (completedRentals.length === 0) {
          this.chartData = null;
          return;
        }

        // 2. Process ONLY the completed rentals.
        const monthlyDurations = completedRentals.reduce((acc, rental) => {
          const startDate = new Date(rental.issuedDate);
          const returnDate = new Date(rental.returnedDate);

          // Check for valid dates before calculating
          if (!isNaN(startDate) && !isNaN(returnDate)) {
            const duration = (returnDate - startDate) / (1000 * 60 * 60 * 24);

            if (duration >= 0) {
              const month = startDate.toISOString().slice(0, 7); // YYYY-MM
              if (!acc[month]) acc[month] = [];
              acc[month].push(duration);
            }
          }
          return acc;
        }, {});

        console.log('[RentalDurations] Aggregated monthly durations:', monthlyDurations); // DEBUG: See the aggregated data

        const labels = Object.keys(monthlyDurations).sort();
        if (labels.length === 0) {
          this.chartData = null;
          return;
        }

        const averageDurations = labels.map(month => {
          const durations = monthlyDurations[month];
          const sum = durations.reduce((a, b) => a + b, 0);
          return sum / durations.length;
        });

        this.chartData = {
          labels,
          datasets: [{
            label: 'Average Rental Duration',
            data: averageDurations,
            borderColor: '#36A2EB',
            pointBackgroundColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.2,
            fill: true,
          }]
        };
        console.log('[RentalDurations] Final chart data:', this.chartData); // DEBUG: Check the final output
      } catch (error) {
        console.error('[RentalDurations] Error processing chart data:', error);
        this.chartData = null;
      } finally {
        this.isLoading = false;
      }
    }
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