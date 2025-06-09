<template>
  <div class="chart-container">
    <LoadingModalSection :show="isLoading" show>Analyzing price groups...</LoadingModalSection>
    <Pie v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>
    <div v-if="!isLoading && !chartData" class="no-data">
      No rental data available to display price group distribution.
    </div>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { Chart, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";

Chart.register(ArcElement, Title, Tooltip, Legend);

/**
 * PieChart.vue
 * Displays a pie chart showing the distribution of rentals across different price groups.
 * This component receives its data via props and does not perform its own API calls.
 */
export default {
  name: 'PieChart', // Renamed from RentalsDistributionChart for simplicity
  components: {
    Pie,
    LoadingModalSection,
  },
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
            text: 'Rental Distribution by Price Group'
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
     * Processes the raw rentalsData prop to count rentals per price group.
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

          const priceGroupDistribution = {};
          rentals.forEach((rental) => {
            if (rental && rental.car && rental.car.priceGroup) {
              const priceGroup = rental.car.priceGroup;
              priceGroupDistribution[priceGroup] = (priceGroupDistribution[priceGroup] || 0) + 1;
            }
          });

          const labels = Object.keys(priceGroupDistribution);
          const data = Object.values(priceGroupDistribution);

          if (labels.length > 0) {
            this.chartData = {
              labels: labels,
              datasets: [
                {
                  label: 'Number of Rentals',
                  data: data,
                  backgroundColor: [ // A consistent color palette for price groups
                    'rgba(75, 192, 192, 0.7)',  // ECONOMY
                    'rgba(54, 162, 235, 0.7)',  // STANDARD
                    'rgba(255, 206, 86, 0.7)', // LUXURY
                    'rgba(153, 102, 255, 0.7)',// PREMIUM
                    'rgba(255, 99, 132, 0.7)',  // EXOTIC
                    'rgba(255, 159, 64, 0.7)', // SPECIAL
                    'rgba(201, 203, 207, 0.7)',// OTHER/NONE
                  ],
                  borderColor: '#fff',
                  borderWidth: 1,
                },
              ],
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