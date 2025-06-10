<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading">Loading chart...</LoadingModalSection>
    <Line v-if="!isLoading && chartData" :data="chartData" :options="chartOptions"/>
    <div v-if="!isLoading && !chartData" class="no-data">
      No rental data available to display.
    </div>
  </div>
</template>

<script>
import {Line} from 'vue-chartjs';
import {Chart, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement} from 'chart.js';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
import {fetchRentalsData} from './rentalsApi'; // External data fetching

// Register necessary Chart.js components. This is a side effect of importing this module.
Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

/**
 * @file RentalDurations.vue
 * @description A component that displays a Line chart representing the average rental durations (in days)
 * over time, based on rental issue dates. It fetches rental data, calculates daily average durations,
 * and handles rentals not yet returned or with invalid date ranges.
 * @component RentalDurations
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'RentalDurations',
  components: {
    Line,
    LoadingModalSection,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} chartData - Data object for the Chart.js Line chart. Null until data is processed.
   * @property {object} chartOptions - Configuration options for the Line chart, including scales, legend, title,
   *                                   tooltips, and custom point styling for 'N/A' values (if data supports it).
   * @property {boolean} isLoading - Flag to control the visibility of the loading indicator.
   */
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        elements: { // Custom styling for points on the line chart
          point: {
            radius: 4,
            borderWidth: 1,
            borderColor: '#f87979', // Default point border color
            // pointStyle callback can customize points, e.g., for 'N/A' values if they were passed as strings.
            // Current data processing maps 'N/A' to null, causing gaps, so this specific callback might not trigger for 'N/A'.
            pointStyle: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value === 'N/A' ? 'rectRot' : 'circle'; // Example: different style if raw data was 'N/A'
            },
          },
        },
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
              text: 'Issue Date'
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
          tooltip: { // Custom tooltip formatting
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  // If raw data point was 'N/A' (or another specific non-numeric marker), display that.
                  // Current data processing results in `null` for such points which Chart.js handles as gaps.
                  // To show 'N/A' in tooltip for these gaps, chart data or tooltip logic would need adjustment.
                  if (context.raw === 'N/A' || context.raw === null && context.dataset.data[context.dataIndex] === null) {
                    label += 'N/A';
                  } else {
                    label += context.parsed.y + ' days';
                  }
                } else {
                   label += 'N/A'; // For points that are truly null (gaps)
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
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches and processes rental data to render the line chart of average rental durations.
   * - Fetches all rental data using `fetchRentalsData`.
   * - Groups rentals by their issue date.
   * - For each rental, calculates the duration in days if a valid return date exists.
   *   If not returned or dates are invalid, it's marked as 'N/A'.
   * - For each issue date, calculates the average of all valid numeric rental durations.
   *   If a date has only 'N/A' durations or no numeric data, its average is treated as `null` (creating a gap in the line chart).
   * - Dates on the X-axis are sorted chronologically.
   * - Constructs `chartData` for the Line chart.
   * - Manages loading states and handles errors during fetching or processing.
   * @async
   * @returns {void}
   */
  async mounted() {
    try {
      this.isLoading = true;
      const rentals = await fetchRentalsData(); // External API call

      if (rentals && rentals.length > 0) {
        const rentalDurationsByDate = {};

        rentals.forEach((rental) => {
          const issuedDateStr = rental.issuedDate;
          const returnedDateStr = rental.returnedDate;

          if (issuedDateStr) { // Process only if there's an issue date
            const issuedDateOnly = issuedDateStr.split('T')[0]; // Extract YYYY-MM-DD
            let duration;

            if (returnedDateStr) { // If returned, calculate duration
              const issuedTimestamp = Date.parse(issuedDateOnly);
              const returnedTimestamp = Date.parse(returnedDateStr.split('T')[0]); // Also use only date part for consistency

              if (!isNaN(issuedTimestamp) && !isNaN(returnedTimestamp) && returnedTimestamp >= issuedTimestamp) {
                duration = Math.max(0, Math.floor((returnedTimestamp - issuedTimestamp) / (1000 * 60 * 60 * 24))); // Ensure duration is not negative
              } else {
                console.warn(`RentalDurations: Invalid date range for rental ID ${rental.id || 'N/A'}. Issued: ${issuedDateStr}, Returned: ${returnedDateStr}`);
                duration = 'N/A'; // Mark as N/A for invalid range
              }
            } else {
              duration = 'N/A'; // Rental not yet returned
            }

            if (!rentalDurationsByDate[issuedDateOnly]) {
              rentalDurationsByDate[issuedDateOnly] = [];
            }
            rentalDurationsByDate[issuedDateOnly].push(duration);
          } else {
            console.warn(`RentalDurations: Skipping rental due to missing issuedDate: ID ${rental.id || 'N/A'}`);
          }
        });

        const labels = Object.keys(rentalDurationsByDate).sort((a, b) => new Date(a) - new Date(b)); // Sort dates

        const dataset = labels.map((label) => {
          const durations = rentalDurationsByDate[label];
          const numericDurations = durations.filter(d => typeof d === 'number');

          if (numericDurations.length > 0) {
            const sum = numericDurations.reduce((total, d) => total + d, 0);
            return Math.round((sum / numericDurations.length) * 10) / 10; // Average rounded to one decimal place
          } else {
            // If only 'N/A's or no numeric data, this point will be a gap in the line.
            return null;
          }
        });

        if (labels.length > 0) {
            this.chartData = {
            labels: labels,
            datasets: [
              {
                label: 'Avg. Rental Duration (Days)',
                backgroundColor: 'rgba(248, 121, 121, 0.2)',
                borderColor: '#f87979',
                data: dataset,
                fill: true,
                tension: 0.1
              },
            ],
          };
        } else {
            console.log('RentalDurations: No valid data to plot after processing.');
            this.chartData = { labels: [], datasets: [] };
        }
      } else {
        console.log('RentalDurations: No rentals data found or an empty array was returned.');
        this.chartData = { labels: [], datasets: [] };
      }
    } catch (error) {
      console.error('RentalDurations: Error fetching or processing rentals data for chart:', error);
      this.chartData = { labels: [], datasets: [] };
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped> /* Added scoped to prevent styles from leaking */
.chart {
  position: relative; /* For loading modal positioning if needed */
  height: 400px; /* Or any desired height */
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