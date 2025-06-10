<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-book" aria-hidden="true"></i> Damage Report Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" :to="{ name: 'CreateDamageReport' }">
            <i class="fa fa-plus" aria-hidden="true"></i> Add Report
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortDamageReports('uuid')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('description')">Description <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('dateAndTime')">Date & Time <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('location')">Location <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('repairCost')">Repair Cost <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('rental.uuid')">Rental ID <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('rental.receiver')">Receiver <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('rental.issuedDate')">Date Rented <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-if="filteredDamageReports.length === 0">
        <td colspan="9" style="text-align: center;">No damage reports found.</td>
      </tr>
      <tr v-for="damageReport in filteredDamageReports" :key="damageReport.uuid">
        <td v-if="!damageReport.editing">{{ damageReport.uuid }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.uuid" disabled />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.description }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.description" required />
        </td>
        <td v-if="!damageReport.editing">{{ formatDateTime(damageReport.dateAndTime) }}</td>
        <td v-else>
          <input type="datetime-local" v-model="damageReport.dateAndTime" required />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.location }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.location" required />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.repairCost }}</td>
        <td v-else>
          <input type="number" v-model.number="damageReport.repairCost" min="0" required />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.rental?.uuid }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.rental.uuid" disabled />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.rental?.receiver }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.rental.receiver" disabled />
        </td>
        <td v-if="!damageReport.editing">{{ formatDateTime(damageReport.rental?.issuedDate) }}</td>
        <td v-else>
          <input type="datetime-local" v-model="damageReport.rental.issuedDate" disabled />
        </td>
        <td>
          <template v-if="!damageReport.editing">
            <button @click="editDamageReport(damageReport)" class="update-button button">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button @click="deleteDamageReport(damageReport)" class="delete-button button"> <!-- Pass whole object -->
              <i class="fas fa-trash-alt"></i> Delete
            </button>
            <button @click="openDamageReportView(damageReport.uuid)" class="read-button button">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button @click="saveDamageReport(damageReport)" class="accept-button button">
              <i class="fas fa-save"></i> Save
            </button>
            <button @click="cancelEdit(damageReport)" class="cancel-button button">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" :show="loading"></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @confirm="confirmDeleteDamageReport"
        @cancel="cancelDeleteDamageReport"
    >
      <template v-if="damageReportToDelete">
        <div>
          <p>Are you sure you want to delete this report?</p>
          <hr>
          <h3>Damage Report Details:</h3>
          <p>Rental ID: {{ damageReportToDelete.rental?.uuid || 'N/A' }}</p>
          <p>Description: {{ damageReportToDelete.description }}</p>
          <p>Date and Time: {{ formatDateTime(damageReportToDelete.dateAndTime) }}</p>
          <p>Location: {{ damageReportToDelete.location }}</p>
          <p>Repair Cost: {{ damageReportToDelete.repairCost }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal
        v-if="successModal.show"
        :show="successModal.show"
        :message="successModal.message"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :show="failModal.show"
        :message="failModal.message"
        @close="closeModal"
    />
  </div>
</template>

<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Used in template
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils"; // Used for display

/**
 * @file DamageReportManagement.vue
 * @description Admin component for managing damage reports associated with rentals.
 * Allows viewing, searching, sorting, inline editing, creating (via navigation), and deleting damage reports.
 * @component DamageReportManagement
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "DamageReportManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} damageReports - Stores all fetched damage report objects, each augmented with an `editing` flag.
   * @property {string} searchQuery - Current search query for filtering reports.
   * @property {string} sortKey - The key (can be a dot-separated nested path like 'rental.uuid') for the property to sort by.
   * @property {number} sortOrder - The direction of sorting (1 for 'asc', -1 for 'desc').
   * @property {boolean} loading - Indicates if data is being fetched or an operation is in progress.
   * @property {boolean} showConfirmationModal - Controls visibility of the delete confirmation modal.
   * @property {object|null} damageReportToDelete - Stores the report object marked for deletion.
   * @property {Array<object>} originalDamageReports - Stores a deep copy of fetched reports to allow reverting edits.
   * @property {object} successModal - Controls the success modal state.
   * @property {object} failModal - Controls the failure modal state.
   */
  data() {
    return {
      damageReports: [],
      searchQuery: "",
      sortKey: "dateAndTime", // Default sort key
      sortOrder: -1,         // Default sort order (descending for newest first)
      loading: false,
      showConfirmationModal: false,
      damageReportToDelete: null,
      originalDamageReports: [],
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    /**
     * Filters the `damageReports` array based on the `searchQuery`.
     * The search is case-insensitive and checks multiple fields, including some nested properties from `rental`.
     * (Note: Sorting is applied directly to `this.damageReports` by the `sortDamageReports` method).
     * @returns {Array<object>} Filtered list of damage reports.
     */
    filteredDamageReports() {
      // The `damageReports` array is already sorted by `sortDamageReports` method.
      // This computed property just applies filtering on the (already sorted) `damageReports`.
      if (!this.searchQuery) {
        return this.damageReports;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.damageReports.filter((report) =>
          [ // Fields to search within
            report.uuid?.toLowerCase(),
            report.description?.toLowerCase(),
            this.formatDateTime(report.dateAndTime)?.toLowerCase(), // Search formatted date
            report.location?.toLowerCase(),
            report.repairCost?.toString().toLowerCase(),
            report.rental?.uuid?.toLowerCase(),
            report.rental?.receiver?.toString().toLowerCase(), // Assuming receiver might be an ID or name
            this.formatDateTime(report.rental?.issuedDate)?.toLowerCase(),
          ].some((field) => field?.includes(query))
      );
    },
  },
  /**
   * Lifecycle hook called when the component is created.
   * Fetches the initial list of damage reports.
   */
  created() {
    this.fetchDamageReports();
  },
  methods: {
    /**
     * Exposes the `formatDateTime` utility function to the template.
     * @param {string} dateTimeString - The ISO date-time string.
     * @returns {string} Formatted date-time string.
     */
    formatDateTime, // from dateUtils
    /**
     * Fetches damage reports from the admin API.
     * Initializes `editing: false` for each report and stores originals for edit cancellation.
     * Handles loading states and feedback.
     * @async
     * @returns {void}
     */
    fetchDamageReports() {
      this.loading = true;
      api.get("/api/v1/admin/damage-reports")
          .then((response) => {
            const { data, errors, status } = response.data || {};
            console.log("DamageReportManagement - API Response:", response.data);
            if (response.status === 204 || !data || (Array.isArray(data) && data.length === 0)) {
              this.damageReports = [];
              this.originalDamageReports = [];
              // this.showSuccessModal("No damage reports found."); // Avoid for empty list
            } else if (status === "success" && Array.isArray(data)) {
              this.damageReports = data.map((report) => ({
                ...report,
                // Ensure dateAndTime is in the correct format for datetime-local if directly bound for edit
                // For display, formatDateTime is used. For editing, it might need pre-formatting if not already ISO.
                dateAndTime: report.dateAndTime ? new Date(report.dateAndTime).toISOString().substring(0, 16) : null,
                editing: false,
              }));
              this.originalDamageReports = JSON.parse(JSON.stringify(this.damageReports));
              this.sortDamageReports(this.sortKey, true); // Apply initial sort without toggling order
            } else {
              throw new Error(errors?.map(e => e.message).join(", ") || "Invalid API response while fetching damage reports.");
            }
          })
          .catch((error) => {
            const message = error.response?.status === 401
                ? "Unauthorized access. Please log in again."
                : error.message || "Failed to fetch damage reports.";
            this.showFailureModal(message);
            console.error("Error fetching damage reports:", error.response || error);
            this.damageReports = []; // Clear on error
            this.originalDamageReports = [];
            if (error.response?.status === 401) {
              this.$router.push("/login"); // Consider global auth handler
            }
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Sorts the `damageReports` array directly based on the provided key and current sortOrder.
     * Handles nested property paths (e.g., 'rental.uuid').
     * @param {string} key - The property key (can be dot-separated for nested properties) to sort by.
     * @param {boolean} [initialSort=false] - If true, sorts using current sortOrder without toggling.
     * @returns {void}
     */
    sortDamageReports(key, initialSort = false) {
      if (!initialSort) {
        if (this.sortKey === key) {
          this.sortOrder *= -1; // Toggle direction
        } else {
          this.sortKey = key;
          this.sortOrder = 1;   // Default to ascending for new column
        }
      }

      // Helper to get nested property value
      const getValue = (obj, path) => {
        if (obj === null || obj === undefined) return "";
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || "";
      };

      this.damageReports.sort((a, b) => {
        const valA = getValue(a, this.sortKey);
        const valB = getValue(b, this.sortKey);

        let comparison = 0;
        // Handle specific types if necessary, e.g., dates or numbers
        if (this.sortKey.includes('dateAndTime') || this.sortKey.includes('issuedDate')) {
            comparison = (new Date(valA) || 0) - (new Date(valB) || 0);
        } else if (this.sortKey === 'repairCost' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && valA !== '' && valB !== '')) {
            comparison = Number(valA) - Number(valB);
        } else {
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        }
        return comparison * this.sortOrder;
      });
      // Note: filteredDamageReports computed property will use this sorted array.
    },
    /**
     * Initiates the deletion of a damage report. Sets `damageReportToDelete` and shows confirmation modal.
     * @param {object} damageReport - The damage report object to delete.
     * @returns {void}
     */
    deleteDamageReport(damageReport) { // In template, it's called deleteDamageReport(damageReport)
      this.damageReportToDelete = damageReport; // Store the whole object
      this.showConfirmationModal = true;
    },
    /**
     * Executes deletion of `damageReportToDelete` after user confirmation.
     * Calls API and refreshes list on success. Manages loading and feedback.
     * @async
     * @returns {void}
     */
    confirmDeleteDamageReport() {
      if (this.damageReportToDelete?.uuid) {
        this.loading = true;
        api.delete(`/api/v1/admin/damage-reports/${this.damageReportToDelete.uuid}`)
            .then((response) => {
              // Standard success check (200/204 for DELETE)
              if (response.status === 200 || response.status === 204 || response.data?.status === "success") {
                this.showSuccessModal("Damage report deleted successfully.");
                this.fetchDamageReports(); // Refresh list
              } else {
                 throw new Error(response.data?.errors?.map(e => e.message).join(", ") || `Delete responded with status: ${response.status}`);
              }
            })
            .catch((error) => {
              this.showFailureModal(error.response?.data?.message || error.message || "Failed to delete damage report.");
              console.error("Error deleting damage report:", error.response || error);
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false;
              this.damageReportToDelete = null;
            });
      } else {
        this.showConfirmationModal = false;
        this.damageReportToDelete = null;
      }
    },
    /** Cancels deletion and hides confirmation modal. */
    cancelDeleteDamageReport() { this.damageReportToDelete = null; this.showConfirmationModal = false; },
    /**
     * Enables inline editing for a damage report.
     * @param {object} damageReport - The report object to edit.
     * @returns {void}
     */
    editDamageReport(damageReport) { damageReport.editing = true; },
    /**
     * Saves changes to an edited damage report.
     * Validates required fields and PUTs data to API. Refreshes list on success.
     * @param {object} damageReport - The report object with updated data.
     * @async
     * @returns {void}
     */
    saveDamageReport(damageReport) {
      if (!damageReport.description || !damageReport.dateAndTime || !damageReport.location || damageReport.repairCost == null) {
        this.showFailureModal("Description, Date/Time, Location, and Repair Cost are required.");
        return;
      }
      this.loading = true;
      // Payload should match DamageReportUpdateDTO - exclude rental details if not updatable here
      const payload = {
        description: damageReport.description,
        dateAndTime: damageReport.dateAndTime, // Ensure this is ISO format if edited
        location: damageReport.location,
        repairCost: parseFloat(damageReport.repairCost) || 0,
        // rentalUuid: damageReport.rental?.uuid // Only if backend DTO accepts rentalUuid for update
      };
      api.put(`/api/v1/admin/damage-reports/${damageReport.uuid}`, payload)
          .then((response) => {
            if (response.data?.status === "success") {
              this.showSuccessModal("Damage report updated successfully.");
              damageReport.editing = false; // Turn off editing mode
              this.fetchDamageReports(); // Refresh to get latest, clean data
            } else {
              throw new Error(response.data?.errors?.map(e => e.message).join(", ") || "Failed to update damage report: Server error.");
            }
          })
          .catch((error) => {
            this.showFailureModal(error.response?.data?.message || error.message || "Failed to update damage report.");
            console.error("Error updating damage report:", error.response || error);
            // Optionally, keep editing mode: damageReport.editing = true;
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Cancels inline editing for a report, reverting changes from `originalDamageReports`.
     * @param {object} damageReport - The report object being edited.
     * @returns {void}
     */
    cancelEdit(damageReport) {
      const original = this.originalDamageReports.find((r) => r.uuid === damageReport.uuid); // Match by uuid
      if (original) {
        Object.assign(damageReport, original); // Revert data
        damageReport.editing = false; // Ensure editing flag is also reset
      } else {
        damageReport.editing = false; // If somehow not found, just turn off editing
      }
    },
    /**
     * Navigates to a detailed view page for a specific damage report.
     * @param {string} uuid - The UUID of the report to view.
     * @returns {void}
     */
    openDamageReportView(uuid) { this.$router.push({name: 'ViewDamageReport', params: { uuid: uuid } }); },
    /** Resets search query and re-applies sort/filter. */
    resetSearch() { this.searchQuery = ""; this.applyFiltersAndSort(); /* Trigger re-filter and re-sort */ },
    /** Shows success modal. @param {string} message */
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    /** Shows failure modal. @param {string} message */
    showFailureModal(message) { this.failModal = { show: true, message }; },
    /** Closes active success/failure modals. */
    closeModal() { this.successModal.show = false; this.failModal.show = false; },
    /** Navigates back. */
    goBack() { this.$router.go(-1); },
  },
};
</script>

<style scoped>

</style>