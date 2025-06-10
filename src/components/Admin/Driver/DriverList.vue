<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of {{ category ? category : 'All' }} Drivers</h1>
      <div v-if="isLoading" class="loading-message">Loading drivers...</div>
      <table v-else-if="drivers.length > 0">
        <thead>
        <tr>
          <!-- Assuming sort keys match properties on driver object, using uuid for ID if applicable -->
          <th @click="sortDrivers('uuid')">ID (UUID) <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('licenseCode')">License Code <i class="fas fa-sort"></i></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.uuid"> <!-- Assuming uuid is the primary key -->
          <td>{{ driver.uuid ? driver.uuid.substring(0,8) : 'N/A' }}...</td>
          <td>{{ driver.firstName }}</td>
          <td>{{ driver.lastName }}</td>
          <td>{{ driver.licenseCode }}</td>
        </tr>
        </tbody>
      </table>
      <div v-else class="no-data-message">No drivers found for this category.</div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
// import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Not used in template
import api from "@/api";

/**
 * @file DriverList.vue
 * @description Admin component for displaying a list of drivers, potentially filtered by a category
 * specified in the route parameters. The list is sortable by various columns.
 * This component is primarily for display and does not include actions like edit/delete.
 * @component AdminDriverList
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminDriverList', // Renamed
  // components: {
  //   LoadingModal, // Removed as it's not used in the template
  // },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} drivers - Stores the list of driver objects.
   * @property {string} category - Stores the category of drivers being displayed, derived from route params.
   * @property {string} sortColumn - The key of the driver property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   * @property {boolean} isLoading - Flag to indicate if data is currently being fetched.
   */
  data() {
    return {
      drivers: [],
      category: '',
      sortColumn: 'lastName', // Default sort column
      sortDirection: 'asc',  // Default sort direction
      isLoading: false,      // Added for loading state
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the initial list of drivers based on route parameters.
   */
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    /**
     * Fetches drivers from the API, based on a category from route parameters.
     * (Note: The API endpoint `/api/v1/admin/drivers/${categoryParam}` suggests filtering by category path parameter.
     * If 'all' is a special category, the backend must handle it. Alternatively, a different endpoint
     * or query parameters might be used for fetching all drivers vs. categorized ones.)
     * Populates the `drivers` and `category` data properties. Manages loading state.
     * @async
     * @returns {void}
     */
    fetchDrivers() {
      this.isLoading = true;
      const categoryParam = this.$route.params.category || 'all';

      const endpoint = `/api/v1/admin/drivers/${categoryParam}`;

      api.get(endpoint)
          .then((response) => {
            const responseData = response.data?.data || response.data;
            this.drivers = Array.isArray(responseData) ? responseData : [];
            this.category = categoryParam;
            if (!Array.isArray(responseData)) {
               console.warn("AdminDriverList - fetchDrivers: API response was not in expected array format.", responseData);
            }
          })
          .catch((error) => {
            console.error('Error fetching drivers:', error.response || error.message || error);
            this.drivers = []; // Clear on error
          })
          .finally(() => {
            this.isLoading = false;
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
          // Assuming 'uuid' is string. If other IDs are numeric and need numeric sort:
          if (this.sortColumn === 'uuid' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !== 'string' && typeof valB !== 'string') ) {
             // For UUIDs, string comparison is usually better unless they are sequential numbers.
             // If UUIDs are purely numeric and need numeric sort, this is fine. Otherwise, stick to localeCompare.
             // For this example, treating UUID as string for sorting.
             comparison = String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' });
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
/* Styles for the UserList component */
/* Ensure these are specific enough or adapt global styles */
.loading-message, .no-data-message {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>