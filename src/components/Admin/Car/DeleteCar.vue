<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of {{ category }} Cars</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortCars('id')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortCars('make')">Make <i class="fas fa-sort"></i></th>
          <th @click="sortCars('model')">Model <i class="fas fa-sort"></i></th>
          <th @click="sortCars('year')">Year <i class="fas fa-sort"></i></th>
          <th @click="sortCars('category')">Category <i class="fas fa-sort"></i></th>
          <th @click="sortCars('priceGroup')">Price Group <i class="fas fa-sort"></i></th>
          <th @click="sortCars('licensePlate')">License Plate <i class="fas fa-sort"></i></th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="car in sortedCars" :key="car.id"> <!-- Corrected from sortAboutUs and uses sortedCars -->
          <td>{{ car.id }}</td>
          <td>{{ car.make }}</td>
          <td>{{ car.model }}</td>
          <td>{{ car.year }}</td>
          <td>{{ car.category }}</td>
          <td>{{ car.priceGroup }}</td>
          <td>{{ car.licensePlate }}</td>
          <td>
            <button @click="deleteCar(car.id)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Removed, global api instance should handle interceptors and calls
import api from "@/api"; // Use the pre-configured Axios instance

// The local Axios request interceptor has been removed.
// Token handling should be managed globally by the `api` instance.

/**
 * @file DeleteCar.vue
 * @description Admin component for listing cars (currently fetches from a potentially public '/api/cars/all' endpoint)
 * and provides functionality to delete them. Cars are displayed in a sortable table.
 * @component DeleteCar
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'DeleteCar',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} cars - Stores the list of car objects fetched from the API.
   * @property {string} category - Stores the category of cars being displayed (currently hardcoded to 'all').
   * @property {string} sortColumn - The key of the car property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   */
  data() {
    return {
      cars: [],
      category: '', // Set by fetchCars
      sortColumn: 'id', // Default sort column
      sortDirection: 'asc', // Default sort direction
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
     * Fetches cars from the API.
     * Currently uses a hardcoded category 'all' resulting in the endpoint '/api/cars/all'.
     * (Note: This might be a public endpoint. For admin deletion, consider fetching from an admin-specific endpoint
     * that lists all cars intended for admin management, e.g., '/api/v1/admin/cars').
     * Populates the `cars` and `category` data properties.
     * @async
     * @returns {void}
     */
    fetchCars() {
      const categoryToFetch = 'all'; // Hardcoded category
      // const token = localStorage.getItem('token'); // Redundant: api instance handles token
      api.get(`/api/cars/${categoryToFetch}`) // Using potentially public endpoint
          .then((response) => {
            // Assuming API returns an array directly, or adjust if nested (e.g., response.data.data)
            this.cars = Array.isArray(response.data) ? response.data : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
            this.category = categoryToFetch;
            if (!Array.isArray(this.cars) && !(response.data?.data && Array.isArray(response.data.data))) {
               console.warn("DeleteCar - fetchCars: API response was not in expected array format. Data:", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching cars:', error.response || error.message || error);
            this.cars = []; // Clear on error
            // Optionally show a user-facing error message
          });
    },
    /**
     * Sets the sort column and toggles the sort direction for the car table.
     * The `sortedCars` computed property handles the actual sorting.
     * @param {string} column - The key of the car property to sort by.
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
     * Deletes a car by its ID using an admin API endpoint.
     * Re-fetches the car list on successful deletion to update the UI.
     * @param {string|number} carId - The ID of the car to delete.
     * @async
     * @returns {void}
     */
    deleteCar(carId) {
      // const token = localStorage.getItem('token'); // Redundant: api instance handles token
      // Optional: Add a confirmation modal here for better UX.
      api.delete(`/api/admin/cars/delete/${carId}`) // Corrected to use api instance and leading slash
          .then((response) => {
            console.log('Car deleted successfully:', response); // Success logs can be removed if too verbose
            this.fetchCars(); // Refresh the list
            // Optionally show a success message to the user
          })
          .catch((error) => {
            console.error('Error deleting car:', error.response || error.message || error);
            // Optionally show a user-facing error message, e.g., via a modal
            // this.showFailureModal(`Failed to delete car: ${error.response?.data?.message || error.message}`);
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `cars` array based on `sortColumn` and `sortDirection`.
     * Handles string and numeric comparisons robustly.
     * @returns {Array<object>} The sorted array of car entries.
     */
    sortedCars() {
      let sorted = [...this.cars];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = a[this.sortColumn];
          let valB = b[this.sortColumn];

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          // Basic numeric check for year, id, or other numeric fields
          if (this.sortColumn === 'year' || this.sortColumn === 'id' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !=='string' && typeof valB !=='string')) {
            comparison = Number(valA) - Number(valB);
          } else { // Default to locale-aware string comparison
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          }
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      return sorted;
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
