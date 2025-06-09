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
// import axios from 'axios'; // Unused, api instance is used
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import api from "@/api";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

/**
 * @file CarList.vue
 * @description This component displays a list of available cars.
 * It fetches car data from the API based on a price group specified in the route parameters.
 * Users can sort the car list by various columns and initiate the booking process for a selected car.
 * Includes loading states, empty states, and error handling using modals.
 * @component CarList
 */
export default {
  name: 'CarList',
  /**
   * Components registered for use within this component.
   * @type {object}
   * @property {Component} LoadingModal - Modal to indicate loading state.
   * @property {Component} FailureModal - Modal to display failure/error messages.
   */
  components: {
    LoadingModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} cars - Array to store the fetched car objects.
   * @property {string} sortColumn - The column currently used for sorting the car list.
   * @property {string} sortDirection - The direction of sorting ('asc' or 'desc').
   * @property {boolean} loading - Flag to indicate if car data is currently being loaded.
   * @property {object} failModal - Object to control the failure modal.
   * @property {boolean} failModal.show - Visibility state of the failure modal.
   * @property {string} failModal.message - Message to display in the failure modal.
   */
  data() {
    return {
      cars: [],
      sortColumn: '',
      sortDirection: 'asc', // Default sort direction
      loading: false,
      failModal: {
        show: false,
        message: "",
      },
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted to the DOM.
   * It triggers the initial fetch of available cars.
   */
  mounted() {
    this.fetchAvailableCars();
  },
  /**
   * Watchers for reactive properties.
   * @type {object}
   * @property {Function} $route.params.pricegroup - Watches for changes in the 'pricegroup' route parameter.
   *                                                If it changes, `fetchAvailableCars` is called to reload data.
   */
  watch: {
    '$route.params.pricegroup': function(newPriceGroup, oldPriceGroup) {
      if (newPriceGroup !== oldPriceGroup) {
        this.fetchAvailableCars();
      }
    }
  },
  methods: {
    /**
     * Fetches available cars from the API.
     * The API endpoint is determined by the `pricegroup` route parameter.
     * If `pricegroup` is 'all' or not specified, all available cars are fetched.
     * Otherwise, cars are filtered by the specified price group.
     * Updates `cars` data property and handles loading and error states.
     * @async
     * @returns {void}
     */
    fetchAvailableCars() {
      this.loading = true;
      const priceGroupParam = this.$route.params.pricegroup;
      let endpoint = `/api/v1/cars/available`;

      if (priceGroupParam && priceGroupParam.toLowerCase() !== 'all') {
        endpoint += `/price-group/${priceGroupParam}`;
        console.log(`Fetching available cars for price group: ${priceGroupParam}`);
      } else {
        console.log("Fetching all available cars (no specific price group).");
      }

      api.get(endpoint)
          .then((response) => {
            if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
              this.cars = response.data.data;
            } else if (response.status === 204 || (response.data && Array.isArray(response.data.data) && response.data.data.length === 0)) {
              this.cars = [];
            } else {
              console.warn("Unexpected response structure:", response.data);
              this.cars = [];
            }
            this.loading = false;
          })
          .catch((error) => {
            console.error("Error fetching available cars:", error.response || error);
            this.cars = [];
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
    /**
     * Sets the sort column and toggles the sort direction.
     * The actual sorting is performed by the `sortedCars` computed property.
     * @param {string} column - The key of the car object property to sort by.
     * @returns {void}
     */
    sortCars(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    /**
     * Handles the car booking action.
     * Checks if the user is logged in. If not, shows a failure modal prompting login.
     * If logged in, navigates to the 'CreateBooking' page with the selected car's UUID.
     * @param {object} car - The car object to be booked.
     * @returns {void}
     */
    bookCar(car) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        this.showFailureModal("You need to be logged in to book a car. Redirecting to login page...");
      } else {
        console.log('Booking car:', car.make, car.model, car.uuid);
        this.$router.push({ name: 'CreateBooking', params: { carUuid: car.uuid } });
      }
    },
    /**
     * Shows the failure modal with a specified message.
     * @param {string} message - The message to display in the failure modal.
     * @returns {void}
     */
    showFailureModal(message) {
      this.failModal = { show: true, message: message };
    },
    /**
     * Closes the failure modal. If the modal message indicates a login requirement,
     * it redirects the user to the login page.
     * @returns {void}
     */
    closeFailureModalAndRedirectToLogin() {
      this.failModal.show = false;
      if (this.failModal.message.toLowerCase().includes("logged in to book")) {
        this.$router.push({ name: 'Login' });
      }
    },
    /**
     * Closes the failure modal without any redirection logic.
     * @returns {void}
     */
    closeModal() {
      this.failModal.show = false;
    },
    /**
     * Navigates to the previous page in the browser's history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
  },
  /**
   * Computed properties for the component.
   * @type {object}
   * @property {string} pageTitle - Dynamically generates the page title based on the current price group filter.
   * @property {Array<object>} sortedCars - Returns a sorted version of the `cars` array based on `sortColumn` and `sortDirection`.
   */
  computed: {
    pageTitle() {
      const priceGroupParam = this.$route.params.pricegroup;
      if (priceGroupParam && priceGroupParam.toLowerCase() !== 'all') {
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

          if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            return this.sortDirection === 'asc' ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
          }

          valA = (valA === null || valA === undefined) ? "" : String(valA);
          valB = (valB === null || valB === undefined) ? "" : String(valB);

          if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
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

