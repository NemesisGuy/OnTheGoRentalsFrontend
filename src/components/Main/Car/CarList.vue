<template>
  <div class="content-container">
    <h1>{{ pageTitle }}</h1> <!-- Use the computed pageTitle -->
    <loading-modal v-if="loading" show message="Fetching available cars..."/>
    <div v-if="!loading && cars.length === 0" class="no-cars-message">
      <p>No cars available matching your criteria. Please try a different selection.</p>
    </div>
    <table v-if="!loading && cars.length > 0">
      <thead>
      <tr>
        <!-- Make sure sortCars parameter matches a key in your car objects -->
        <th @click="sortCars('uuid')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortCars('make')">Make <i class="fas fa-sort"></i></th>
        <th @click="sortCars('model')">Model <i class="fas fa-sort"></i></th>
        <th @click="sortCars('year')">Year <i class="fas fa-sort"></i></th>
        <th @click="sortCars('category')">Category <i class="fas fa-sort"></i></th>
        <th @click="sortCars('priceGroup')">Price Group <i class="fas fa-sort"></i></th>
        <th @click="sortCars('licensePlate')">License Plate <i class="fas fa-sort"></i></th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="car in sortedCars" :key="car.uuid">
        <td>{{ car.uuid ? car.uuid.substring(0, 8) + '...' : 'N/A' }}</td>
        <td>{{ car.make }}</td>
        <td>{{ car.model }}</td>
        <td>{{ car.year }}</td>
        <td>{{ car.category }}</td>
        <td>{{ car.priceGroup }}</td>
        <td>{{ car.licensePlate }}</td>
        <td>
          <button class="accept-button button" @click="bookCar(car)"><i class="fas fa-handshake"></i> Book</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div class="button-container">
      <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
    </div>
  </div>
  <FailureModal v-if="failModal.show"
                @close="closeFailureModalAndRedirectToLogin"
                @cancel="closeModal"
                :show="failModal.show"
                :message="failModal.message"/>
</template>

<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import api from "@/api";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
// In CarList.vue

export default {
  name: 'CarList',
  components: {
    LoadingModal,
    FailureModal,
  },
  data() {
    return {
      cars: [],
      // 'category' data property seems unused if filtering is by price group from route params
      // priceGroupFromRoute: '', // To store the route param for display or logic
      sortColumn: '',
      sortDirection: 'asc', // Default sort direction
      loading: false,
      failModal: {
        show: false,
        message: "",
      },
    };
  },
  mounted() {
    // Fetch cars when the component is mounted.
    // The pricegroup will come from the route parameters.
    this.fetchAvailableCars();
  },
  watch: {
    // Watch for changes in route parameters if the user can navigate
    // between different price groups while staying on this component.
    '$route.params.pricegroup': function(newPriceGroup, oldPriceGroup) {
      if (newPriceGroup !== oldPriceGroup) {
        this.fetchAvailableCars();
      }
    }
  },
  methods: {
    fetchAvailableCars() {
      this.loading = true;
      // Price group comes from the route, e.g., /cars/available/for-rent/LUXURY
      // Or if you have a route like /cars/for-rent?priceGroup=LUXURY, use this.$route.query.priceGroup
      const priceGroupParam = this.$route.params.pricegroup; // Assuming it's a route param

      let endpoint = `/api/v1/cars/available`; // Base for available cars

      if (priceGroupParam && priceGroupParam.toLowerCase() !== 'all') {
        // If a specific price group is provided (and it's not "all"), append it.
        // The backend (with a StringToPriceGroupConverter) should handle case-insensitivity.
        endpoint += `/price-group/${priceGroupParam}`;
        console.log(`Fetching available cars for price group: ${priceGroupParam}`);
      } else {
        // If priceGroupParam is 'all', undefined, or empty, fetch all available cars.
        console.log("Fetching all available cars (no specific price group).");
      }

      api.get(endpoint)
          .then((response) => {
            if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
              this.cars = response.data.data;
            } else if (response.status === 204 || (response.data && Array.isArray(response.data.data) && response.data.data.length === 0)) {
              this.cars = []; // No content or empty list
            } else {
              console.warn("Unexpected response structure:", response.data);
              this.cars = []; // Default to empty on unexpected structure
            }
            // this.priceGroupFromRoute = priceGroupParam || 'All'; // For display purposes
            this.loading = false;
          })
          .catch((error) => {
            console.error("Error fetching available cars:", error.response || error);
            this.cars = []; // Clear cars on error
            this.loading = false;
            let msg = "Failed to fetch available cars.";
            if (error.response?.data?.errors?.[0]?.message) {
              msg = error.response.data.errors[0].message;
            } else if (error.response?.data?.message) {
              msg = error.response.data.message;
            } else if (error.message) {
              msg = error.message;
            }
            this.showFailureModal(msg);
          });
    },
    sortCars(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      // The actual sorting is now handled by the 'sortedCars' computed property
    },
    bookCar(car) {
      const token = localStorage.getItem('accessToken'); // Or however you store your token
      if (!token) {
        this.showFailureModal("You need to be logged in to book a car. Redirecting to login page...");
        // The modal's close action will handle the redirect.
      } else {
        console.log('Booking car:', car.make, car.model, car.uuid);
        this.$router.push({ name: 'CreateBooking', params: { carUuid: car.uuid } }); // Changed to BookingCreate
      }
    },

    showFailureModal(message) {
      this.failModal = { show: true, message: message };
    },
    closeFailureModalAndRedirectToLogin() {
      this.failModal.show = false;
      // Only redirect if the message indicates a login is required
      if (this.failModal.message.toLowerCase().includes("logged in to book")) {
        this.$router.push({ name: 'Login' });
      }
    },
    closeModal() { // Generic close for failure modal if no redirect needed
      this.failModal.show = false;
    },
    goBack() {
      this.$router.go(-1);
    },
  },
  computed: {
    // Title for the page, reflecting the current filter
    pageTitle() {
      const priceGroupParam = this.$route.params.pricegroup;
      if (priceGroupParam && priceGroupParam.toLowerCase() !== 'all') {
        // Capitalize first letter for display
        const displayGroup = priceGroupParam.charAt(0).toUpperCase() + priceGroupParam.slice(1).toLowerCase();
        return `Available ${displayGroup} Cars`;
      }
      return 'Available Cars';
    },
    sortedCars() {
      let carsToSort = [...this.cars];
      if (this.sortColumn) {
        carsToSort.sort((a, b) => {
          let valA = a[this.sortColumn];
          let valB = b[this.sortColumn];

          // Handle boolean for 'available' field if you sort by it
          if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            return this.sortDirection === 'asc' ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
          }

          valA = (valA === null || valA === undefined) ? "" : String(valA);
          valB = (valB === null || valB === undefined) ? "" : String(valB);

          if (!isNaN(Number(valA)) && !isNaN(Number(valB))) { // Check if both are numbers
            return this.sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
          } else {
            return this.sortDirection === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
          }
        });
      }
      return carsToSort;
    },
  },
};
</script>
<style >
.content-container {
  max-width: 100%;
}
</style>

