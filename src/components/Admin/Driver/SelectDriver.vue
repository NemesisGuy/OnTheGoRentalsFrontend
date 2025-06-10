<template>
  <div class="driver-selection-container">
    <div class="card driver-list-card">
      <h2>Driver List</h2>
      <input type="text" v-model="searchQuery" placeholder="Search Driver (Name, License)..."/>
      <ul>
        <!-- Using uuid as key and for selection -->
        <li v-for="driver in filteredDrivers" :key="driver.uuid" @click="selectDriver(driver.uuid)"
            :class="{ active: selectedDriverUuid === driver.uuid }">
          {{ driver.firstName }} {{ driver.lastName }} ({{ driver.licenseCode }})
        </li>
      </ul>
    </div>

    <div class="card driver-details-card">
      <h2>Driver Profile</h2>
      <div v-if="selectedDriver">
        <div><label>UUID:</label> <span>{{ selectedDriver.uuid ? selectedDriver.uuid.substring(0,8) : 'N/A' }}...</span></div>
        <div><label>First Name:</label> <span>{{ selectedDriver.firstName }}</span></div>
        <div><label>Last Name:</label> <span>{{ selectedDriver.lastName }}</span></div>
        <div><label>License Code:</label> <span>{{ selectedDriver.licenseCode }}</span></div>
      </div>
      <div v-else>
        <p>No driver selected.</p>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
import api from "@/api";

/**
 * @file SelectDriver.vue
 * @description An admin component that allows selection of a driver from a filterable list
 * and displays their basic details. Useful for associating a driver with another entity.
 * @component AdminSelectDriver
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminSelectDriver', // Renamed for admin context
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} drivers - Stores the list of all driver objects.
   * @property {string|null} selectedDriverUuid - The UUID of the currently selected driver.
   * @property {object|null} selectedDriver - The full object of the currently selected driver.
   * @property {string} searchQuery - The current search query for filtering the driver list.
   */
  data() {
    return {
      drivers: [],
      selectedDriverUuid: null, // Changed from selectedDriverId, initialized to null
      selectedDriver: null,
      searchQuery: '',
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
     * Fetches the list of drivers from the '/api/v1/admin/drivers' API endpoint.
     * Populates the `drivers` data property.
     * @async
     * @returns {void}
     */
    fetchDrivers() {
      api.get('/api/v1/admin/drivers') // Standardized admin endpoint
          .then((response) => {
            const responseData = response.data?.data || response.data;
            this.drivers = Array.isArray(responseData) ? responseData : [];
            if (!Array.isArray(responseData)) {
               console.warn("AdminSelectDriver - fetchDrivers: API response was not in expected array format.", responseData);
            }
          })
          .catch((error) => {
            console.error('Error fetching drivers:', error.response || error.message || error);
            this.drivers = []; // Clear drivers on error
            // Optionally show a user-facing error message
          });
    },
    /**
     * Handles the selection of a driver from the list.
     * Sets `selectedDriverUuid` and updates `selectedDriver` with the chosen driver's object.
     * @param {string} driverUuid - The UUID of the driver that was selected.
     * @returns {void}
     */
    selectDriver(driverUuid) {
      this.selectedDriverUuid = driverUuid;
      this.selectedDriver = this.drivers.find((driver) => driver.uuid === this.selectedDriverUuid) || null;
    },
  },
  computed: {
    /**
     * Filters the `drivers` array based on the `searchQuery`.
     * The search is case-insensitive and checks first name, last name, and license code.
     * @returns {Array<object>} The filtered list of driver entries.
     */
    filteredDrivers() {
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim();
        return this.drivers.filter((driver) => {
          const firstName = driver.firstName ? String(driver.firstName).toLowerCase() : '';
          const lastName = driver.lastName ? String(driver.lastName).toLowerCase() : '';
          const licenseCode = driver.licenseCode ? String(driver.licenseCode).toLowerCase() : '';
          return firstName.includes(query) || lastName.includes(query) || licenseCode.includes(query);
        });
      }
      return this.drivers; // Return all drivers if no search query
    },
  },
};
</script>

<style scoped>

</style>
