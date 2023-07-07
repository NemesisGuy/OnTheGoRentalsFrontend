<template>
  <div class="chart">
    <LoadingModalSection :show="isLoading">Loading chart...</LoadingModalSection>
    <Pie v-if="!isLoading && chartData" :data="chartData" :options="chartOptions" />

  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs';
import { Pie } from 'vue-chartjs';

import { fetchRentalsData } from './rentalsApi';
import LoadingModalSection from "@/components/Main/Modals/LoadingModalSection.vue";
import { PriceGroup } from '@/enums/PriceGroup';

export default {
  name: 'RentalsDistributionChart',
  components: {
    Pie,
    LoadingModalSection,
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
      },
      isLoading: false,
    };
  },
  async mounted() {
    try {
      this.isLoading = true; // Show loading modal
      const rentalsData = await fetchRentalsData();
      console.log('Rentals Data:', rentalsData); // Debug statement
      if (rentalsData && rentalsData.length > 0) {
        const priceGroupDistribution = countPriceGroupDistribution(rentalsData); // Count price group distribution based on the data
        console.log('Price Group Distribution:', priceGroupDistribution); // Debug statement
        const priceGroups = Object.keys(priceGroupDistribution);
        const backgroundColor = priceGroups.map((priceGroup, index) => {
          const colorIndex = index % 7; // Adjust the number 7 based on the number of price groups
          return getBackgroundColor(colorIndex);
        });
        this.chartData = {
          labels: priceGroups, // Use the price groups as labels
          datasets: [
            {
              label: 'Rentals Distribution',
              data: Object.values(priceGroupDistribution), // Distribution values
              backgroundColor: backgroundColor,
            },
          ],
        };
      } else {
        console.error('Error fetching rentals data or data is empty');
      }
    } catch (error) {
      console.error('Error fetching rentals data:', error);
    } finally {
      this.isLoading = false; // Hide loading modal
    }
  },
};

// Function to count price group distribution based on the data
// Function to count price group distribution based on the data
function countPriceGroupDistribution(data) {
  const priceGroupDistribution = {};
  data.forEach((rental) => {
    const priceGroup = rental.car.priceGroup; // Access the priceGroup property from rental.car
    if (priceGroupDistribution[priceGroup]) {
      priceGroupDistribution[priceGroup]++;
    } else {
      priceGroupDistribution[priceGroup] = 1;
    }
  });
  return priceGroupDistribution;
}


// Function to get background color based on the color index
function getBackgroundColor(index) {
  const colors = [
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(201, 203, 207, 0.6)',
  ];
  return colors[index];
}
</script>
