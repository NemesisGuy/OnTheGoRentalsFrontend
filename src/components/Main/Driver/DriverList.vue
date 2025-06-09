<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Driver</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortColumn('name')">Name</th>
          <th @click="sortColumn('contactInfo')">Contact Info</th>
          <th @click="sortColumn('borrowingHistory')">Borrowing History</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.driverId">
          <td>{{ driver.name }}</td>
          <td>{{ driver.contactInfo }}</td>
          <td>{{ driver.borrowingHistory }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
// import axios from 'axios'; // Unused, api instance is used
import api from "@/api";

/**
 * @file DriverList.vue
 * @description This component displays a sortable list of drivers.
 * It fetches driver data from an API and presents it in a table format,
 * allowing users to sort the list by name, contact information, or borrowing history.
 * @component DriverList
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'DriverList',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} drivers - An array to store the fetched driver objects.
   * @property {string} sortColumn - The key of the driver object property currently used for sorting. Defaults to 'name'.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc'). Defaults to 'asc'.
   */
  data() {
    return {
      drivers: [],
      sortColumn: 'name',
      sortDirection: 'asc'
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted to the DOM.
   * It triggers the fetching of driver data.
   */
  mounted() {
    this.fetchDrivers();
  },
  /**
   * Computed properties for the component.
   * @type {object}
   * @property {Array<object>} sortedDrivers - Returns a sorted version of the `drivers` array
   *                                          based on the current `sortColumn` and `sortDirection`.
   *                                          Sorts strings case-insensitively.
   */
  computed: {
    sortedDrivers() {
      let sorted = [...this.drivers];

      sorted.sort((a, b) => {
        // Ensure properties exist and default to empty string if not, then convert to lowercase string for comparison
        const fieldA = (a[this.sortColumn] === null || a[this.sortColumn] === undefined) ? "" : String(a[this.sortColumn]).toLowerCase();
        const fieldB = (b[this.sortColumn] === null || b[this.sortColumn] === undefined) ? "" : String(b[this.sortColumn]).toLowerCase();

        let comparison = 0;
        if (fieldA > fieldB) {
          comparison = 1;
        } else if (fieldA < fieldB) {
          comparison = -1;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });

      return sorted;
    }
  },
  // Watchers for sortColumn and sortDirection are removed as they are redundant.
  // The computed property `sortedDrivers` will automatically re-evaluate when these data properties change.
  methods: {
    /**
     * Fetches the list of drivers from the backend API.
     * Updates the `drivers` data property upon successful retrieval.
     * Logs an error to the console if the fetch fails.
     * @async
     * @returns {void}
     */
    fetchDrivers() {
      api
          .get('/api/drivers') // Assuming this is the correct endpoint for fetching drivers
          .then(response => {
            // Ensure response.data is an array; adjust if API returns object with a drivers array
            this.drivers = Array.isArray(response.data) ? response.data : [];
            if (!Array.isArray(response.data)) {
              console.warn("fetchDrivers: API response was not an array. Data:", response.data);
            }
          })
          .catch(error => {
            console.error('Error fetching drivers:', error);
            this.drivers = []; // Clear drivers on error
          });
    },
    /**
     * Updates the sort column and toggles the sort direction.
     * Called when a table header is clicked.
     * @param {string} column - The key of the driver object property to sort by.
     * @returns {void}
     */
    sortColumn(column) { // Renamed from sortColumn to avoid conflict with data property, though Vue handles it. Standard practice.
      if (column === this.sortColumn) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    // The sortDrivers() method was removed as it was empty and redundant.
    // Changes to sortColumn or sortDirection will automatically trigger
    // the `sortedDrivers` computed property to re-evaluate.
  }
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
