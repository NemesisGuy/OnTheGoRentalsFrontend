
    <template>
      <div class="chart-container">
        <LoadingModalSection v-if="isLoading" show>Calculating durations...</LoadingModalSection>
        <Line v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>
        <div v-if="!isLoading && !chartData" class="no-data">
          No completed rentals with valid dates to display.
        </div>
      </div>
    </template>

    <script>
      import { Line } from 'vue-chartjs';
      import { Chart, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
      import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
      // The 'fetchRentalsData' import is no longer needed.

      Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

      /**
       * RentalDurations.vue
       * A line chart that calculates and displays the average rental duration in days over time.
       * This component receives its data via props and does not perform its own API calls.
       */
      export default {
        name: 'RentalDurations',
        components: {
          Line,
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
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Average Rental Duration (Days)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date of Rental Issue'
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Average Rental Durations Over Time'
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += context.parsed.y.toFixed(1) + ' days'; // Show one decimal place for average
                      }
                      return label;
                    }
                  }
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
           * Processes the raw rentalsData prop to calculate average durations.
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

                const rentalDurationsByDate = {};

                rentals.forEach((rental) => {
                  // Only consider COMPLETED rentals to calculate duration
                  if (rental && rental.status === 'COMPLETED' && rental.issuedDate && rental.returnedDate) {
                    const issuedDateOnly = rental.issuedDate.split('T')[0];

                    const issuedTimestamp = new Date(rental.issuedDate).getTime();
                    const returnedTimestamp = new Date(rental.returnedDate).getTime();

                    if (!isNaN(issuedTimestamp) && !isNaN(returnedTimestamp) && returnedTimestamp >= issuedTimestamp) {
                      // Calculate duration in days, allowing for fractions of a day
                      const duration = (returnedTimestamp - issuedTimestamp) / (1000 * 60 * 60 * 24);
                      if (!rentalDurationsByDate[issuedDateOnly]) {
                        rentalDurationsByDate[issuedDateOnly] = [];
                      }
                      rentalDurationsByDate[issuedDateOnly].push(duration);
                    }
                  }
                });

                const labels = Object.keys(rentalDurationsByDate).sort((a, b) => new Date(a) - new Date(b));

                if (labels.length === 0) {
                  this.chartData = null; // No completed rentals found
                  return;
                }

                const dataset = labels.map((label) => {
                  const durations = rentalDurationsByDate[label];
                  const sum = durations.reduce((total, d) => total + d, 0);
                  return sum / durations.length; // Calculate the average
                });

                this.chartData = {
                  labels: labels,
                  datasets: [
                    {
                      label: 'Avg. Rental Duration (Days)',
                      backgroundColor: 'rgba(248, 121, 121, 0.2)',
                      borderColor: '#f87979',
                      data: dataset,
                      fill: true,
                      tension: 0.2
                    },
                  ],
                };
              } catch (error) {
                console.error('RentalDurations: Error processing chart data:', error);
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
      .chart-container { /* Renamed for clarity and consistency */
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