<template>
  <div class="car-selection-container">
    <div class="card car-list-card">
      <h2>Car List</h2>
      <input type="text" v-model="searchQuery" placeholder="Search Car"/>
      <ul>
        <li v-for="car in filteredCars" :key="car.id" @click="selectCar(car.id)"
            :class="{ active: selectedCarId === car.id }">
          {{ car.make }} {{ car.model }} ({{ car.year }})
        </li>
      </ul>
    </div>

    <div class="card car-details-card">
      <h2>Car Details</h2>
      <div v-if="selectedCar">
        <div>
          <label>Make:</label>
          <span>{{ selectedCar.make }}</span>
        </div>
        <div>
          <label>Model:</label>
          <span>{{ selectedCar.model }}</span>
        </div>
        <div>
          <label>Year:</label>
          <span>{{ selectedCar.year }}</span>
        </div>
        <div>
          <label>Category:</label>
          <span>{{ selectedCar.category }}</span>
        </div>
        <div>
          <label>Price Group:</label>
          <span>{{ selectedCar.priceGroup }}</span>
        </div>
        <div>
          <label>License Plate:</label>
          <span>{{ selectedCar.licensePlate }}</span>
        </div>
      </div>
      <div v-else>
        <p>No car selected.</p>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Removed, api instance should be used
import api from "@/api"; // Use the pre-configured Axios instance

// The local Axios request interceptor has been removed.
// Token handling should be managed globally by the `api` instance.

/**
 * @file SelectCar.vue
 * @description A component that allows users to select a car from a filterable list
 * and view its details. Primarily used for selection purposes within a larger workflow.
 * @component CarSelection
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'CarSelection',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} cars - Stores the list of all car objects fetched from the API.
   * @property {string|null} selectedCarId - The ID of the currently selected car. Null if no car is selected.
   * @property {object|null} selectedCar - The full object of the currently selected car. Null if no car is selected.
   * @property {string} searchQuery - The current search query string for filtering the car list.
   */
  data() {
    return {
      cars: [],
      selectedCarId: null, // Changed from '' to null for better type consistency
      selectedCar: null,
      searchQuery: '',
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the initial list of cars.
   */
  mounted() {
    this.fetchCars();
  },
  methods: {
    /**
     * Fetches the list of cars from the API endpoint '/api/admin/cars/all'.
     * (Note: This endpoint might differ from other admin car listing endpoints like '/api/v1/admin/cars'.
     * Ensure this is the intended source for this component.)
     * Populates the `cars` data property.
     * @async
     * @returns {void}
     */
    fetchCars() {
      // const token = localStorage.getItem('token'); // Redundant: api instance handles token
      api.get('/api/admin/cars/all')
          .then((response) => {
            // Handle potential nested data structure (e.g., response.data.data) or direct array
            const responseData = response.data?.data || response.data;
            this.cars = Array.isArray(responseData) ? responseData : [];
            if (!Array.isArray(responseData)) {
               console.warn("SelectCar - fetchCars: API response was not in expected array format. Data:", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching cars:', error.response || error.message || error);
            this.cars = []; // Clear cars on error
            // Optionally show a user-facing error message, e.g., via a modal or on-page text
          });
    },
    /**
     * Handles the selection of a car from the list.
     * Sets `selectedCarId` to the ID of the chosen car and updates `selectedCar`
     * with the full car object.
     * @param {string|number} carId - The ID of the car that was selected.
     * @returns {void}
     */
    selectCar(carId) {
      this.selectedCarId = carId;
      this.selectedCar = this.cars.find((car) => car.id === this.selectedCarId) || null; // Ensure null if not found
    },
  },
  computed: {
    /**
     * Filters the `cars` array based on the `searchQuery`.
     * The search is case-insensitive and checks a concatenated string of car make and model.
     * @returns {Array<object>} The filtered list of car entries.
     */
    filteredCars() {
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim();
        return this.cars.filter((car) => {
          // Ensure car.make and car.model exist before calling toLowerCase
          const make = car.make ? String(car.make).toLowerCase() : '';
          const model = car.model ? String(car.model).toLowerCase() : '';
          const makeModel = `${make} ${model}`;
          return makeModel.includes(query);
        });
      }
      return this.cars; // Return all cars if no search query
    },
  },
};
</script>

<style scoped>

</style>
