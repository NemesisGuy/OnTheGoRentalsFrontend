<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Update Cars</h1>
      <h2>List of {{ category }} Cars</h2>
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
          <th>Edit/Save</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="car in sortedCars" :key="car.id">
          <td>{{ car.id }}</td>
          <td>
            <input v-model="car.make" :disabled="!car.editMode"/>
          </td>
          <td>
            <input v-model="car.model" :disabled="!car.editMode"/>
          </td>
          <td>
            <input v-model.number="car.year" :disabled="!car.editMode" type="number"/>
          </td>
          <td>
            <input v-model="car.category" :disabled="!car.editMode"/>
          </td>
          <td>
            <select v-model="car.priceGroup" :disabled="!car.editMode" required>
              <option value="ECONOMY">ECONOMY</option>
              <option value="STANDARD">STANDARD</option>
              <option value="LUXURY">LUXURY</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="EXOTIC">EXOTIC</option>
              <option value="SPECIAL">SPECIAL</option>
              <option value="OTHER">OTHER</option>
              <option value="NONE">NONE</option>
            </select>
          </td>

          <td>
            <input v-model="car.licensePlate" :disabled="!car.editMode"/>
          </td>
          <td>
            <button @click="toggleEditMode(car)">
              {{ car.editMode ? 'Save' : 'Edit' }}
            </button>
          </td>
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
// import axios from 'axios'; // Removed
import api from "@/api"; // Use the pre-configured Axios instance

// Local Axios request interceptor removed.

/**
 * @file UpdateCar.vue
 * @description Admin component for listing, inline editing, and deleting cars.
 * Displays cars in a sortable table, allowing administrators to manage car inventory directly.
 * (Note: `fetchCars` currently uses '/api/cars/all', which might be a public endpoint.
 * Consider using an admin-specific endpoint like '/api/v1/admin/cars' for comprehensive car listing
 * if this component is intended for full admin car management.)
 * @component AdminUpdateCar
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminUpdateCar', // Renamed for consistency
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} cars - Stores the list of car objects, each augmented with an `editMode` flag.
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
     * Fetches cars from the API (currently '/api/cars/all').
     * Initializes an `editMode: false` property for each fetched car.
     * Populates the `cars` and `category` data properties.
     * @async
     * @returns {void}
     */
    fetchCars() {
      const categoryToFetch = 'all'; // Hardcoded category
      // Manual token retrieval removed.
      api.get(`/api/cars/${categoryToFetch}`)
          .then((response) => {
            const responseData = response.data?.data || response.data;
            if (Array.isArray(responseData)) {
              this.cars = responseData.map((car) => ({
                ...car,
                editMode: false, // Initialize editMode for each car
              }));
            } else {
              this.cars = [];
              console.warn("AdminUpdateCar - fetchCars: API response was not in expected array format. Data:", responseData);
            }
            this.category = categoryToFetch;
          })
          .catch((error) => {
            console.error('Error fetching cars:', error.response || error.message || error);
            this.cars = []; // Clear on error
            // Optionally, display a user-facing error message
          });
    },
    /**
     * Sets the sort column and toggles the sort direction for the car table.
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
      // SortedCars computed property will react to these changes.
    },
    /**
     * Deletes a car by its ID using an admin API endpoint.
     * Re-fetches the car list on successful deletion.
     * @param {string|number} carId - The ID of the car to delete.
     * @async
     * @returns {void}
     */
    deleteCar(carId) {
      // Manual token retrieval removed.
      // Optional: Add confirmation modal here.
      api.delete(`/api/admin/cars/delete/${carId}`)
          .then((response) => {
            console.log('Car deleted successfully:', response);
            this.fetchCars(); // Refresh list
            // Optionally show success message
          })
          .catch((error) => {
            console.error('Error deleting car:', error.response || error.message || error);
            // Optionally show failure message
          });
    },
    /**
     * Toggles the edit mode for a car. If saving (i.e., `editMode` was true),
     * it calls `updateCar` to persist the changes.
     * @param {object} car - The car object whose edit mode is being toggled.
     * @returns {void}
     */
    toggleEditMode(car) {
      if (car.editMode) { // Currently in edit mode, so "Save" was clicked
        this.updateCar(car);
      }
      // Toggle editMode after attempting save or if "Edit" was clicked
      // If save fails, editMode might remain true or be reset by fetchCars depending on error handling in updateCar
      car.editMode = !car.editMode;
    },
    /**
     * Updates a car's details via an admin API endpoint.
     * The payload consists of the `car` object (which includes inline edits).
     * (Note: Consider sending only changed fields or a specific DTO for updates).
     * @param {object} carData - The car object containing the updated data.
     * @async
     * @returns {void}
     */
    updateCar(carData) {
      // Manual token retrieval removed.
      // Construct payload, potentially stripping UI-specific fields like 'editMode'
      const payload = { ...carData };
      delete payload.editMode;
      // delete payload.originalData; // If you implement storing original data for revert

      api.put(`/api/admin/cars/update/${carData.id}`, payload) // Corrected to use api instance
          .then((response) => {
            console.log('Car updated successfully:', response);
            // Optionally update carData with response.data.data if returned by API
            // Object.assign(carData, response.data.data);
            // carData.editMode is already toggled by toggleEditMode after this call.
            // If API returns updated object, it's good to merge it.
          })
          .catch((error) => {
            console.error('Error updating car:', error.response || error.message || error);
            // Optionally show failure message
            // Consider reverting changes or re-fetching on error to ensure UI consistency
            this.fetchCars(); // Re-fetch to get consistent state on error
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `cars` array based on `sortColumn` and `sortDirection`.
     * Handles string, numeric, and boolean comparisons robustly.
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
          if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            comparison = valA === valB ? 0 : valA ? -1 : 1; // true before false
          } else if (this.sortColumn === 'year' || this.sortColumn === 'id' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !=='string' && typeof valB !=='string')) {
            comparison = Number(valA) - Number(valB);
          } else {
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
