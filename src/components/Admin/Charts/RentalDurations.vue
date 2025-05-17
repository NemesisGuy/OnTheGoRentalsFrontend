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
import {fetchRentalsData} from './rentalsApi'; // Assuming this path is correct

Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default {
  name: 'RentalDurations',
  components: {
    Line,
    LoadingModalSection,
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false, // Often useful for better layout
        elements: {
          point: {
            radius: 4,
            borderWidth: 1,
            borderColor: '#f87979',
            pointStyle: (context) => {
              const value = context.dataset.data[context.dataIndex];
              // This check might need adjustment if 'N/A' values are transformed to null for plotting
              // For now, we'll keep it, but if averaged data is null, this condition won't be met
              return value === 'N/A' ? 'rectRot' : 'circle';
            },
          },
        },
        scales: { // <-- ADDED/MODIFIED SECTION
          y: {
            beginAtZero: true, // This ensures the Y-axis starts at 0
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
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  // Check if the original value was 'N/A' if you need to display that
                  // This requires more complex data structure or a parallel array
                  // For now, just show the numeric value or 'N/A' if the point itself is 'N/A'
                  if (context.raw === 'N/A') { // Check if the raw data point was 'N/A'
                    label += 'N/A';
                  } else {
                    label += context.parsed.y + ' days';
                  }
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
  async mounted() {
    try {
      this.isLoading = true;
      const rentals = await fetchRentalsData();

      if (rentals && rentals.length > 0) {
        const rentalDurationsByDate = {}; // Object to store rental durations for each date

        rentals.forEach((rental) => {
          // Ensure dates are valid before processing
          const issuedDateStr = rental.issuedDate;
          const returnedDateStr = rental.returnedDate;

          if (issuedDateStr) {
            const issuedDateOnly = issuedDateStr.split('T')[0];
            let duration;

            if (returnedDateStr) {
              const returnedDateOnly = returnedDateStr.split('T')[0];
              // Ensure parsing is robust
              const issuedTimestamp = Date.parse(issuedDateOnly);
              const returnedTimestamp = Date.parse(returnedDateOnly);

              if (!isNaN(issuedTimestamp) && !isNaN(returnedTimestamp) && returnedTimestamp >= issuedTimestamp) {
                duration = Math.floor((returnedTimestamp - issuedTimestamp) / (1000 * 60 * 60 * 24));
              } else {
                // Handle invalid date parse or returnedDate before issuedDate
                console.warn(`Invalid date range for rental: ${rental.id || 'N/A ID'}. Issued: ${issuedDateStr}, Returned: ${returnedDateStr}`);
                duration = 'N/A'; // Or skip this rental
              }
            } else {
              duration = 'N/A'; // Rental not yet returned
            }

            if (!rentalDurationsByDate[issuedDateOnly]) {
              rentalDurationsByDate[issuedDateOnly] = [];
            }
            rentalDurationsByDate[issuedDateOnly].push(duration);
          } else {
            console.warn(`Rental with missing issuedDate: ${rental.id || 'N/A ID'}`);
          }
        });

        // Sort dates for chronological order on the X-axis
        const labels = Object.keys(rentalDurationsByDate).sort((a, b) => new Date(a) - new Date(b));

        const dataset = labels.map((label) => {
          const durations = rentalDurationsByDate[label];
          // Filter out 'N/A' strings and ensure values are numbers for sum and average
          const numericDurations = durations.filter(d => typeof d === 'number');

          if (numericDurations.length > 0) {
            const sum = numericDurations.reduce((total, d) => total + d, 0);
            return Math.round(sum / numericDurations.length);
          } else if (durations.includes('N/A')) {
            // If only 'N/A's, represent as null so Chart.js creates a gap or use 'N/A' for pointStyle
            return null; // Or 'N/A' if you want pointStyle to specifically catch it
          } else {
            return 0; // Or null, if a day with no numeric data and no 'N/A's should be a gap
          }
        });

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Avg. Rental Duration (Days)', // More descriptive label
              backgroundColor: 'rgba(248, 121, 121, 0.2)', // Area fill color
              borderColor: '#f87979', // Line color
              data: dataset,
              fill: true, // Changed to true to fill area under line, common for trends
              tension: 0.1 // Smooths the line a bit
            },
          ],
        };
      } else {
        console.log('No rentals data found or an empty array was returned.');
        // this.chartData remains null, and the v-if in template will show "No rental data..."
      }
    } catch (error) {
      console.error('Error fetching or processing rentals data:', error);
      // this.chartData remains null
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