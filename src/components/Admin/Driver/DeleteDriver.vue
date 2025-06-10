<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Delete Drivers</h1> <!-- More specific title -->
      <table>
        <thead>
        <tr>
          <!-- Assuming sort keys match properties on driver object, using uuid for ID -->
          <th @click="sortDrivers('uuid')">ID (UUID) <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('licenseCode')">License Code <i class="fas fa-sort"></i></th> <!-- Corrected header -->
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.uuid"> <!-- Keyed by uuid -->
          <td>{{ driver.uuid ? driver.uuid.substring(0,8) : 'N/A' }}...</td> <!-- Display truncated uuid -->
          <td>{{ driver.firstName }}</td>
          <td>{{ driver.lastName }}</td>
          <td>{{ driver.licenseCode }}</td>
          <td>
            <button @click="deleteDriverByUuid(driver.uuid)">Delete</button> <!-- Call with uuid -->
          </td>
        </tr>
        </tbody>
      </table>
      <div v-if="loading">Loading drivers...</div>
      <div v-if="!loading && (!drivers || drivers.length === 0)" class="no-data-message">
        No drivers found.
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
import api from "@/api";

/**
 * @file DeleteDriver.vue
 * @description Admin component for listing and deleting driver records.
 * Displays drivers in a sortable table and provides a delete action for each.
 * (Note: User feedback for delete success/failure is currently limited to console logs.
 * No confirmation modal before deletion is implemented in this version.)
 * @component AdminDeleteDriver
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminDeleteDriver', // Renamed
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} drivers - Stores the list of driver objects.
   * @property {string} sortColumn - The key of the driver property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   * @property {boolean} loading - Flag to indicate if data is currently being fetched.
   */
  data() {
    return {
      drivers: [],
      sortColumn: 'lastName', // Default sort column
      sortDirection: 'asc',  // Default sort direction
      loading: false,
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the initial list of drivers.
   */
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    /**
     * Fetches driver records from the '/api/v1/admin/drivers' API endpoint.
     * Populates the `drivers` data property. Manages loading state.
     * @async
     * @returns {void}
     */
    fetchDrivers() {
      this.loading = true;
      api.get('/api/v1/admin/drivers') // Standardized admin endpoint
          .then((response) => {
            const responseData = response.data?.data || response.data;
            this.drivers = Array.isArray(responseData) ? responseData : [];
            if (!Array.isArray(responseData)) {
               console.warn("AdminDeleteDriver - fetchDrivers: API response was not in expected array format.", responseData);
            }
          })
          .catch((error) => {
            console.error('Error fetching drivers:', error.response || error.message || error);
            this.drivers = []; // Clear on error
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Sets the sort column and toggles the sort direction for the drivers table.
     * @param {string} column - The key of the driver property to sort by.
     * @returns {void}
     */
    sortDrivers(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    /**
     * Deletes a driver by their UUID using an admin API endpoint.
     * Re-fetches the driver list on successful deletion.
     * (Note: No user confirmation modal implemented before deletion.)
     * @param {string} driverUuid - The UUID of the driver to delete.
     * @async
     * @returns {void}
     */
    deleteDriverByUuid(driverUuid) { // Renamed and uses UUID
      // Optional: Implement a confirmation modal here.
      // if (!confirm(`Are you sure you want to delete driver ${driverUuid}?`)) return;
      this.loading = true; // Indicate operation
      api.delete(`/api/v1/admin/drivers/${driverUuid}`) // Use UUID and consistent endpoint
          .then((response) => {
            console.log('Driver deleted successfully:', response);
            this.fetchDrivers(); // Refresh the list
            // Optionally, show a success message (e.g., via a modal or toast)
            // alert("Driver deleted successfully.");
          })
          .catch((error) => {
            console.error('Error deleting driver:', error.response || error.message || error);
            // Optionally, show a user-facing error message
            alert("Failed to delete driver: " + (error.response?.data?.message || error.message));
          })
          .finally(() => {
            this.loading = false;
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `drivers` array based on `sortColumn` and `sortDirection`.
     * Handles string and potentially numeric comparisons robustly.
     * @returns {Array<object>} The sorted array of driver entries.
     */
    sortedDrivers() {
      let sorted = [...this.drivers];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = a[this.sortColumn];
          let valB = b[this.sortColumn];

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          // For 'uuid' or other potential ID fields, simple string compare is usually fine.
          // If specific numeric fields existed, they could be handled like:
          // if (this.sortColumn === 'someNumericField') {
          //   comparison = Number(valA) - Number(valB);
          // } else {
          comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          // }
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      return sorted;
    },
  },
};
</script>

<style scoped>
/* Add component-specific styles if needed */
.loading-message, .no-data-message {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>
