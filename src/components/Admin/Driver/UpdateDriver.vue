<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Manage Drivers</h1> <!-- Corrected title -->
      <!-- Removed category display as fetchDrivers gets all drivers -->
      <table>
        <thead>
        <tr>
          <th @click="sortDrivers('uuid')">ID (UUID) <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortDrivers('licenseCode')">License Code <i class="fas fa-sort"></i></th>
          <th>Edit/Save</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.uuid">
          <td>{{ driver.uuid ? driver.uuid.substring(0,8) : 'N/A' }}...</td>
          <td v-if="!driver.editing">{{ driver.firstName }}</td>
          <td v-else>
            <input v-model="driver.editable.firstName" :disabled="!driver.editing"/>
          </td>
          <td v-if="!driver.editing">{{ driver.lastName }}</td>
          <td v-else>
            <!-- Corrected disabled binding -->
            <input v-model="driver.editable.lastName" :disabled="!driver.editing"/>
          </td>
          <td v-if="!driver.editing">{{ driver.licenseCode }}</td>
          <td v-else>
            <input v-model="driver.editable.licenseCode" :disabled="!driver.editing"/>
          </td>
          <td>
            <button class="btn-small" @click="toggleEditMode(driver)">
              {{ driver.editing ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <!-- Added Delete button -->
            <button class="btn-small delete-button" @click="deleteDriverByUuid(driver.uuid)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div v-if="loading">Loading drivers...</div>
      <div v-if="!loading && (!drivers || drivers.length === 0)">No drivers found.</div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Removed
import api from "@/api";

/**
 * @file UpdateDriver.vue
 * @description Admin component for listing, inline editing, and deleting driver records.
 * (Note: User feedback for operations like delete/update is currently limited to console logs.
 * Consider adding global modals for success/failure messages for better UX.)
 * @component AdminUpdateDriver
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminUpdateDriver', // Renamed
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} drivers - Stores the list of driver objects, each augmented with `editing` and `editable` states.
   * @property {string} sortColumn - The key for sorting.
   * @property {string} sortDirection - 'asc' or 'desc'.
   * @property {boolean} loading - Data fetching state.
   * @property {Array<object>} originalDrivers - Stores a deep copy for reverting edits.
   */
  data() {
    return {
      drivers: [],
      // category: '', // Category seems irrelevant if fetching all drivers
      sortColumn: 'lastName',
      sortDirection: 'asc',
      loading: false,
      originalDrivers: [],
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
     * Initializes `editing: false` and `editable: null` for each driver.
     * Populates `originalDrivers` for edit cancellation.
     * @async
     * @returns {void}
     */
    fetchDrivers() {
      this.loading = true;
      // const category = 'all'; // Category 'all' might not be needed if endpoint gives all drivers
      api.get(`/api/v1/admin/drivers`) // Using consistent admin endpoint for all drivers
          .then((response) => {
            const responseData = response.data?.data || response.data;
            if (Array.isArray(responseData)) {
              this.drivers = responseData.map((driver) => ({
                ...driver, // Assuming driver object has uuid, firstName, lastName, licenseCode
                editing: false,
                editable: null, // For storing temporary edits
              }));
              this.originalDrivers = JSON.parse(JSON.stringify(this.drivers));
            } else {
              this.drivers = [];
              this.originalDrivers = [];
              console.warn("AdminUpdateDriver - fetchDrivers: API response not an array.", responseData);
            }
            // this.category = category; // Not needed if not filtering by category
          })
          .catch((error) => {
            console.error('Error fetching drivers:', error.response || error.message || error);
            this.drivers = [];
            this.originalDrivers = [];
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Safely gets a property value from an object, supporting nested paths.
     * @param {object|null} object - The object.
     * @param {string} path - The dot-separated path to the property.
     * @returns {any} The value or empty string if not found.
     */
    getPropertyValue(object, path) {
        if (object == null || typeof path !== 'string') return '';
        // For non-nested properties in this component, direct access is fine.
        // This helper is more useful for sort keys like 'rental.uuid'.
        return path.split('.').reduce((acc, part) => acc && acc[part], object) || "";
    },
    /**
     * Sets sort column and direction.
     * @param {string} column - The key to sort by.
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
     * Deletes a driver by their UUID. Re-fetches list on success.
     * (Note: No confirmation modal implemented here. Consider adding one.)
     * @param {string} driverUuid - The UUID of the driver to delete.
     * @async
     */
    deleteDriverByUuid(driverUuid) { // Renamed and uses UUID
      // Optional: Implement confirmation modal
      // if (!confirm(`Are you sure you want to delete driver ${driverUuid}?`)) return;
      this.loading = true;
      api.delete(`/api/v1/admin/drivers/${driverUuid}`)
          .then((response) => {
            console.log('Driver deleted successfully:', response);
            this.fetchDrivers(); // Refresh
            alert("Driver deleted."); // Basic feedback
          })
          .catch((error) => {
            console.error('Error deleting driver:', error.response || error.message || error);
            alert("Failed to delete driver: " + (error.response?.data?.message || error.message));
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Toggles edit mode for a driver. If saving, calls `updateDriverEntry`.
     * @param {object} driver - The driver object.
     */
    toggleEditMode(driver) {
      if (driver.editing) {
        this.updateDriverEntry(driver);
      } else {
        // Initialize editable data from the current driver state when starting edit
        driver.editable = {
            firstName: driver.firstName,
            lastName: driver.lastName,
            licenseCode: driver.licenseCode,
        };
        driver.editing = true;
      }
    },
    /**
     * Updates a driver with data from its `editable` property.
     * @param {object} driver - The driver object (containing `editable` and `uuid`).
     * @async
     */
    async updateDriverEntry(driver) { // Renamed
      if (!driver.editable) {
        console.error("Update called on driver without editable data.", driver);
        driver.editing = false;
        return;
      }
      this.loading = true;
      const payload = {
        firstName: driver.editable.firstName,
        lastName: driver.editable.lastName,
        licenseCode: driver.editable.licenseCode,
        // Ensure payload matches backend DTO for update (e.g., no uuid in body if it's a path param)
      };
      try {
        const response = await api.put(`/api/v1/admin/drivers/${driver.uuid}`, payload);
        console.log('Driver updated successfully:', response);
        driver.editing = false; // Exit edit mode
        driver.editable = null; // Clear editable data
        // this.fetchDrivers(); // Re-fetch to get latest state and update originalDrivers
        // More optimistic update:
        const index = this.drivers.findIndex(d => d.uuid === driver.uuid);
        if (index !== -1) {
            // Assuming the response.data or response.data.data contains the updated driver object
            const updatedDriverData = response.data?.data || response.data || payload;
            Object.assign(this.drivers[index], updatedDriverData);
            this.drivers[index].editing = false; // Ensure editing is off
            this.drivers[index].editable = null;
            // Update originalDrivers as well for future cancel operations
            this.originalDrivers = JSON.parse(JSON.stringify(this.drivers));
        }
        alert("Driver updated."); // Basic feedback
      } catch (error) {
        console.error('Error updating driver:', error.response || error.message || error);
        alert("Failed to update driver: " + (error.response?.data?.message || error.message));
        // Optionally keep editing mode on error: driver.editing = true;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Cancels editing mode for a driver and reverts changes from `originalDrivers`.
     * @param {object} driver - The driver object.
     */
    cancelEdit(driver) {
        const original = this.originalDrivers.find(d => d.uuid === driver.uuid);
        if (original) {
            Object.assign(driver, original); // Revert to original (which includes original editing: false)
            driver.editable = null; // Clear any stale editable data
        } else { // Fallback if not found in original (should not happen)
            driver.editing = false;
            driver.editable = null;
            // Consider re-fetching as a last resort if data is very inconsistent
            // this.fetchDrivers();
        }
    }
  },
  computed: {
    /**
     * Returns a sorted version of the `drivers` array.
     * @returns {Array<object>} Sorted drivers.
     */
    sortedDrivers() {
      let sorted = [...this.drivers];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.sortColumn); // Use getPropertyValue
          let valB = this.getPropertyValue(b, this.sortColumn);

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          if (this.sortColumn === 'uuid' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !== 'string' && typeof valB !== 'string')) {
            // For UUIDs, numeric sort is not appropriate, use string compare.
            // For other potentially numeric IDs that are not UUIDs, numeric sort might be okay.
            // The provided logic tries numeric if possible, otherwise string.
             comparison = Number(valA) - Number(valB);
             if (isNaN(comparison)) { // Fallback to string if numeric conversion failed or was inappropriate
                comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
             }
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
/* Minimal styles for table inputs for inline editing */
td input[type="text"],
td input[type="number"] {
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-small {
  padding: 4px 8px;
  font-size: 0.8em;
  margin-right: 4px;
}
.delete-button {
  background-color: #f44336; /* Red */
  color: white;
  border: none;
}
.loading, .no-data-message {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>
