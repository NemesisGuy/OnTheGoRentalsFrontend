<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Delete Damage Reports</h1> <!-- More specific title -->
      <table>
        <thead>
        <tr>
          <!-- Assuming sort keys match direct properties or handled by getPropertyValue in computed sort -->
          <th @click="sortReports('uuid')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortReports('description')">Description <i class="fas fa-sort"></i></th>
          <th @click="sortReports('dateAndTime')">Date & Time <i class="fas fa-sort"></i></th>
          <th @click="sortReports('location')">Location <i class="fas fa-sort"></i></th>
          <th @click="sortReports('repairCost')">Repair Cost <i class="fas fa-sort"></i></th>
          <th @click="sortReports('rental.uuid')">Rental ID <i class="fas fa-sort"></i></th>
          <th @click="sortReports('rental.issuedDate')">Date Rented <i class="fas fa-sort"></i></th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <!-- Corrected v-for and td data mapping -->
        <tr v-for="report in sortedDamageReports" :key="report.uuid"> <!-- Assuming uuid is the unique key -->
          <td>{{ report.uuid ? report.uuid.substring(0,8) : 'N/A' }}...</td>
          <td>{{ report.description }}</td>
          <td>{{ formatDisplayDateTime(report.dateAndTime) }}</td>
          <td>{{ report.location }}</td>
          <td>{{ report.repairCost != null ? '$' + report.repairCost.toFixed(2) : 'N/A' }}</td>
          <td>{{ report.rental?.uuid ? report.rental.uuid.substring(0,8) : 'N/A' }}...</td>
          <td>{{ formatDisplayDateTime(report.rental?.issuedDate) }}</td>
          <td>
            <button @click="deleteReport(report.uuid)">Delete</button> <!-- Pass uuid -->
          </td>
        </tr>
        </tbody>
      </table>
      <div v-if="loading" class="loading-message">Loading reports...</div>
      <div v-if="!loading && (!damageReports || damageReports.length === 0)" class="no-data-message">
        No damage reports found.
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils"; // For date formatting

/**
 * @file DeleteDamageReport.vue
 * @description Admin component for listing and deleting damage reports.
 * Displays reports in a sortable table and provides a delete action for each.
 * (Note: User feedback for delete success/failure is currently limited to console logs.
 * No confirmation modal before deletion is implemented in this version.)
 * @component DeleteDamageReport
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'DeleteDamageReport',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} damageReports - Stores the list of damage report objects.
   * @property {string} sortColumn - The key (can be nested path) of the report property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   * @property {boolean} loading - Flag to indicate if data is currently being fetched.
   */
  data() {
    return {
      damageReports: [], // Renamed from 'damageReport'
      sortColumn: 'dateAndTime', // Default sort column
      sortDirection: 'desc',  // Default sort direction (newest first)
      loading: false,
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the initial list of damage reports.
   */
  mounted() {
    this.fetchDamageReports();
  },
  methods: {
    /**
     * Exposes formatDateTime utility to the template.
     */
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString);
    },
    /**
     * Fetches damage reports from the '/api/v1/admin/damage-reports' API endpoint.
     * Populates the `damageReports` data property. Manages loading state.
     * @async
     * @returns {void}
     */
    fetchDamageReports() {
      this.loading = true;
      api.get('/api/v1/admin/damage-reports') // Consistent API path
          .then((response) => {
            const responseData = response.data?.data || response.data;
            this.damageReports = Array.isArray(responseData) ? responseData : [];
            if (!Array.isArray(responseData)) {
               console.warn("DeleteDamageReport - fetchDamageReports: API response was not in expected array format.", responseData);
            }
            // Apply initial sort if needed, or ensure computed property handles it
            // this.sortReports(this.sortColumn, true); // If sort method supports initial sort flag
          })
          .catch((error) => {
            console.error('Error fetching damage reports:', error.response || error.message || error);
            this.damageReports = []; // Clear on error
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
        return path.split('.').reduce((acc, part) => acc && acc[part], object) || "";
    },
    /**
     * Sets the sort column and toggles the sort direction for the table.
     * @param {string} columnKey - The key (can be nested path) of the report property to sort by.
     * @returns {void}
     */
    sortReports(columnKey) { // Renamed from sortDamageReports for brevity
      if (this.sortColumn === columnKey) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = columnKey;
        this.sortDirection = 'asc';
      }
      // Computed property `sortedDamageReports` will react.
    },
    /**
     * Deletes a damage report by its UUID using an admin API endpoint.
     * Re-fetches the report list on successful deletion.
     * (Note: No user confirmation modal implemented before deletion.)
     * @param {string} reportUuid - The UUID of the damage report to delete.
     * @async
     * @returns {void}
     */
    deleteReport(reportUuid) { // Renamed from deleteDamageReport
      // Optional: Implement a confirmation modal here.
      // For example: if (!confirm(`Are you sure you want to delete report ${reportUuid}?`)) return;
      this.loading = true; // Indicate operation in progress
      api.delete(`/api/v1/admin/damage-reports/${reportUuid}`)
          .then((response) => {
            console.log('Damage Report deleted successfully:', response);
            this.fetchDamageReports(); // Refresh the list
            // Optionally, show a success message to the user
          })
          .catch((error) => {
            console.error('Error deleting damage report:', error.response || error.message || error);
            // Optionally, show a user-facing error message
            alert("Failed to delete damage report: " + (error.response?.data?.message || error.message));
          })
          .finally(()=> {
            this.loading = false;
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `damageReports` array based on `sortColumn` and `sortDirection`.
     * Handles string, numeric, and date comparisons robustly.
     * @returns {Array<object>} The sorted array of damage reports.
     */
    sortedDamageReports() {
      let sorted = [...this.damageReports];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.sortColumn);
          let valB = this.getPropertyValue(b, this.sortColumn);

          let comparison = 0;
          if (this.sortColumn.includes('dateAndTime') || this.sortColumn.includes('issuedDate')) {
            comparison = (new Date(valA) || 0) - (new Date(valB) || 0);
          } else if (this.sortColumn === 'repairCost' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && valA !== '' && valB !== '')) {
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
/* Add component-specific styles if needed */
.loading-message, .no-data-message {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>
