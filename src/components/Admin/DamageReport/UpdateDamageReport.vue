<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Update Damage Reports</h1> <!-- Changed title -->
      <!-- Removed second h1 "List of Queries" -->
      <table>
        <thead>
        <tr>
          <th @click="sortReports('uuid')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortReports('description')">Description <i class="fas fa-sort"></i></th>
          <th @click="sortReports('dateAndTime')">Date & Time <i class="fas fa-sort"></i></th>
          <th @click="sortReports('location')">Location <i class="fas fa-sort"></i></th>
          <th @click="sortReports('repairCost')">Repair Cost <i class="fas fa-sort"></i></th>
          <th @click="sortReports('rental.uuid')">Rental ID <i class="fas fa-sort"></i></th>
          <th @click="sortReports('rental.receiver')">Receiver <i class="fas fa-sort"></i></th>
          <th @click="sortReports('rental.issuedDate')">Date Rented <i class="fas fa-sort"></i></th>
          <th>Edit/Save</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="report in sortedDamageReports" :key="report.uuid"> <!-- Assuming uuid is the key -->
          <td>{{ report.uuid ? report.uuid.substring(0,8) : 'N/A' }}...</td>
          <td v-if="!report.editing">{{ report.description }}</td>
          <td v-else>
            <input type="text" v-model="report.editable.description" />
          </td>
          <td v-if="!report.editing">{{ formatDisplayDateTime(report.dateAndTime) }}</td>
          <td v-else>
            <input type="datetime-local" v-model="report.editable.dateAndTime" />
          </td>
          <td v-if="!report.editing">{{ report.location }}</td>
          <td v-else>
            <input type="text" v-model="report.editable.location" />
          </td>
          <td v-if="!report.editing">{{ report.repairCost != null ? '$' + report.repairCost.toFixed(2) : 'N/A' }}</td>
          <td v-else>
            <input type="number" step="0.01" v-model.number="report.editable.repairCost" />
          </td>
          <!-- Displaying rental details (read-only even in edit mode for the report) -->
          <td>{{ report.rental?.uuid ? report.rental.uuid.substring(0,8) : 'N/A' }}...</td>
          <td>{{ report.rental?.receiver || 'N/A' }}</td>
          <td>{{ formatDisplayDateTime(report.rental?.issuedDate) }}</td>
          <td>
            <button class="btn-small" @click="toggleEditMode(report)">
              {{ report.editing ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <!-- Added Delete button -->
            <button class="btn-small delete-button" @click="initiateDeleteReport(report)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div v-if="loading">Loading reports...</div>
      <div v-if="!loading && (!damageReports || damageReports.length === 0)">No damage reports found.</div>
    </div>
    <!-- Confirmation Modal for Delete (example structure) -->
    <confirmation-modal
        :show="showDeleteConfirmationModal"
        @confirm="confirmDeleteReport"
        @cancel="cancelDeleteReport"
      >
      <template v-if="reportToDelete">
        <p>Are you sure you want to delete this damage report?</p>
        <p>ID: {{ reportToDelete.uuid }}</p>
        <p>Description: {{ reportToDelete.description }}</p>
      </template>
    </confirmation-modal>
  </div>
</template>

<script>
// import axios from 'axios'; // Removed
import api from "@/api";
import { formatDateTime, formatInputDateTime } from "@/utils/dateUtils";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue"; // Assuming usage

/**
 * @file UpdateDamageReport.vue
 * @description Admin component for listing, inline editing, and deleting damage reports.
 * (Note: User feedback for operations like delete/update is currently limited to console logs and basic text.
 * Consider adding global modals for success/failure messages for better UX.)
 * @component AdminUpdateDamageReport
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminUpdateDamageReport', // Renamed
  components: {
      ConfirmationModal, // Added for delete confirmation
      // Add LoadingModal, SuccessModal, FailureModal if you implement full feedback
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} damageReports - Stores the list of damage reports, each augmented with `editing` and `editable` states.
   * @property {string} sortColumn - The key (can be nested) for sorting.
   * @property {string} sortDirection - 'asc' or 'desc'.
   * @property {boolean} loading - Indicates data fetching state.
   * @property {object|null} reportToDelete - Stores report object for delete confirmation.
   * @property {boolean} showDeleteConfirmationModal - Controls delete confirmation modal.
   * @property {Array<object>} originalDamageReports - Stores a deep copy for reverting edits.
   */
  data() {
    return {
      damageReports: [], // Renamed
      sortColumn: 'dateAndTime', // Default sort
      sortDirection: 'desc',
      loading: false,
      reportToDelete: null,
      showDeleteConfirmationModal: false,
      originalDamageReports: [], // For cancelling edits
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
    /** Exposes date formatting utility to template. */
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString);
    },
    /**
     * Fetches damage reports from the API. Initializes `editing` state and `originalDamageReports`.
     * @async
     * @returns {void}
     */
    fetchDamageReports() { // Renamed
      this.loading = true;
      api.get('/api/v1/admin/damage-reports') // Consistent endpoint
          .then((response) => {
            const responseData = response.data?.data || response.data;
            if (Array.isArray(responseData)) {
              this.damageReports = responseData.map(report => ({
                ...report,
                editing: false,
                editable: null // For storing pending edits
              }));
              this.originalDamageReports = JSON.parse(JSON.stringify(this.damageReports));
            } else {
              this.damageReports = [];
              this.originalDamageReports = [];
              console.warn("AdminUpdateDamageReport - fetchDamageReports: API response was not an array.", responseData);
            }
          })
          .catch((error) => {
            console.error('Error fetching damage reports:', error.response || error.message || error);
            this.damageReports = [];
            this.originalDamageReports = [];
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
     * Sets sort column and direction.
     * @param {string} columnKey - The key to sort by.
     */
    sortReports(columnKey) { // Renamed
      if (this.sortColumn === columnKey) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = columnKey;
        this.sortDirection = 'asc';
      }
    },
    /**
     * Initiates deletion of a damage report by showing a confirmation modal.
     * @param {object} report - The damage report object to delete.
     */
    initiateDeleteReport(report) {
        this.reportToDelete = report;
        this.showDeleteConfirmationModal = true;
    },
    /**
     * Confirms and executes deletion of the report stored in `reportToDelete`.
     * @async
     */
    async confirmDeleteReport() {
        if (!this.reportToDelete?.uuid) return;
        this.loading = true;
        try {
            await api.delete(`/api/v1/admin/damage-reports/${this.reportToDelete.uuid}`);
            console.log('Damage Report deleted:', this.reportToDelete.uuid);
            this.fetchDamageReports(); // Refresh
            alert("Report deleted successfully!"); // Basic feedback
        } catch (error) {
            console.error('Error deleting damage report:', error.response || error.message || error);
            alert("Failed to delete report: " + (error.response?.data?.message || error.message));
        } finally {
            this.loading = false;
            this.showDeleteConfirmationModal = false;
            this.reportToDelete = null;
        }
    },
    /** Cancels deletion process. */
    cancelDeleteReport() {
        this.showDeleteConfirmationModal = false;
        this.reportToDelete = null;
    },
    /**
     * Toggles edit mode for a report. If saving, calls `updateDamageReportEntry`.
     * @param {object} report - The damage report object.
     */
    toggleEditMode(report) {
      if (report.editing) { // Was in edit mode, now saving
        this.updateDamageReportEntry(report);
      } else { // Was in view mode, now editing
        // Store a copy of current data in 'editable' for isolated editing
        report.editable = {
            description: report.description,
            // Format date for datetime-local input
            dateAndTime: formatInputDateTime(report.dateAndTime),
            location: report.location,
            repairCost: report.repairCost,
            // Note: rental details are typically not editable from damage report form
        };
        report.editing = true;
      }
    },
    /**
     * Updates a damage report with data from its `editable` property.
     * @param {object} report - The damage report object (containing `editable` and `uuid`).
     * @async
     */
    async updateDamageReportEntry(report) { // Renamed
      if (!report.editable) {
        console.error("Update called on report without editable data.", report);
        report.editing = false; // Exit edit mode if something is wrong
        return;
      }
      this.loading = true;
      const payload = {
        description: report.editable.description,
        dateAndTime: new Date(report.editable.dateAndTime).toISOString(), // Ensure ISO format
        location: report.editable.location,
        repairCost: parseFloat(report.editable.repairCost) || 0,
        // Do NOT include rental object or rental UUID if not updatable via this DTO.
        // rentalUuid: report.rental?.uuid // Only if backend DTO supports it
      };
      try {
        await api.put(`/api/v1/admin/damage-reports/${report.uuid}`, payload);
        console.log('Damage Report updated:', report.uuid);
        report.editing = false; // Exit edit mode on success
        report.editable = null; // Clear editable data
        this.fetchDamageReports(); // Refresh to get the very latest state
        alert("Report updated successfully!"); // Basic feedback
      } catch (error) {
        console.error('Error updating damage report:', error.response || error.message || error);
        alert("Failed to update report: " + (error.response?.data?.message || error.message));
        // Do not change report.editing state on error, let user retry or cancel
      } finally {
        this.loading = false;
      }
    },
    /**
     * Cancels editing mode for a report and reverts changes from original data.
     * @param {object} report - The report object.
     */
    cancelEdit(report) {
        const original = this.originalDamageReports.find(r => r.uuid === report.uuid);
        if (original) {
            Object.assign(report, original); // Revert data
            report.editing = false; // Ensure editing flag is also reset from original state
            report.editable = null; // Clear editable data
        } else { // Fallback if original not found (should not happen ideally)
            report.editing = false;
            report.editable = null;
            // Optionally re-fetch to ensure data consistency if original is lost
            // this.fetchDamageReports();
        }
    }
  },
  computed: {
    /**
     * Returns a sorted version of the `damageReports` array.
     * @returns {Array<object>} Sorted damage reports.
     */
    sortedDamageReports() {
      let sorted = [...this.damageReports];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.sortColumn);
          let valB = this.getPropertyValue(b, this.sortColumn);

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

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
/* Minimal styles for table inputs for inline editing */
td input[type="text"],
td input[type="number"],
td input[type="datetime-local"],
td textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
td textarea {
  min-height: 50px; /* Adjust as needed */
  resize: vertical;
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
