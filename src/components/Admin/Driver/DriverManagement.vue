<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-id-card" aria-hidden="true"></i> Driver Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search by Name, License Code..." type="text" /> <!-- Placeholder updated -->
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" :to="{ name: 'CreateDriver' }"> <!-- Ensure 'AdminCreateDriver' route name -->
            <i class="fa fa-plus" aria-hidden="true"></i> Add Driver
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <!-- Assuming sort keys match properties available on driver object, like uuid -->
        <th @click="sortDrivers('uuid')">ID (UUID) <i class="fas fa-sort"></i></th>
        <th @click="sortDrivers('firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortDrivers('lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortDrivers('licenseCode')">License Code <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-if="filteredDrivers.length === 0">
        <td colspan="5" style="text-align: center;">No drivers found.</td>
      </tr>
      <!-- Using driver.uuid as key -->
      <tr v-for="driver in filteredDrivers" :key="driver.uuid">
        <td v-if="!driver.editing">{{ driver.uuid ? driver.uuid.substring(0,8) : 'N/A' }}...</td>
        <td v-else>
          <!-- Display UUID, but it's not editable -->
          <input v-model="driver.uuid" disabled type="text" />
        </td>
        <td v-if="!driver.editing">{{ driver.firstName }}</td>
        <td v-else>
          <input v-model="driver.editable.firstName" type="text" required />
        </td>
        <td v-if="!driver.editing">{{ driver.lastName }}</td>
        <td v-else>
          <input v-model="driver.editable.lastName" type="text" required />
        </td>
        <td v-if="!driver.editing">{{ driver.licenseCode }}</td>
        <td v-else>
          <input v-model="driver.editable.licenseCode" type="text" required />
        </td>
        <td>
          <template v-if="!driver.editing">
            <button class="read-button button" @click="openDriverView(driver.uuid)">
              <i class="fas fa-eye"></i> Read
            </button>
            <button class="update-button button" @click="editDriver(driver)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button button" @click="initiateDeleteDriver(driver)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </template>
          <template v-else>
            <button class="accept-button button" @click="saveDriver(driver)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="cancel-button button" @click="cancelEdit(driver)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading drivers...</div> <!-- More specific loading message -->
    <loading-modal v-if="loading" :show="loading" message="Fetching drivers..."></loading-modal> <!-- Pass message to modal -->

    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelDeleteDriver"
        @confirm="confirmDeleteDriver"
    >
      <template v-if="driverToDelete">
        <div>
          <p>Are you sure you want to delete this driver?</p>
          <hr>
          <h3>Driver Details:</h3>
          <p>ID (UUID): {{ driverToDelete.uuid }}</p>
          <p>Name: {{ driverToDelete.firstName }} {{ driverToDelete.lastName }}</p>
          <p>License Code: {{ driverToDelete.licenseCode }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    />
  </div>
</template>

<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

/**
 * @file DriverManagement.vue
 * @description Admin component for managing driver records.
 * Provides functionalities for viewing, searching, sorting, inline editing, creating (via navigation),
 * and deleting driver entries. Uses modals for confirmations and feedback.
 * @component DriversManagement
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "DriversManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} drivers - Stores all fetched driver objects, each augmented with `editing` and `editable` states.
   * @property {string} searchQuery - Current search query for filtering drivers.
   * @property {string} sortKey - The key of the driver property currently used for sorting (e.g., 'uuid', 'firstName').
   * @property {number} sortOrder - The direction of sorting (1 for 'asc', -1 for 'desc').
   * @property {boolean} loading - Indicates if data is being fetched or an operation is in progress.
   * @property {boolean} showConfirmationModal - Controls visibility of the delete confirmation modal.
   * @property {object|null} driverToDelete - Stores the driver object marked for deletion.
   * @property {Array<object>} originalDrivers - Stores a deep copy of fetched drivers to allow reverting edits.
   * @property {object} successModal - Controls the success modal state ({show: boolean, message: string}).
   * @property {object} failModal - Controls the failure modal state ({show: boolean, message: string}).
   */
  data() {
    return {
      drivers: [],
      searchQuery: "",
      sortKey: "lastName", // Default sort key
      sortOrder: 1,        // Default sort order (asc)
      loading: false,
      showConfirmationModal: false,
      driverToDelete: null,
      originalDrivers: [],
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    /**
     * Filters the `drivers` array based on the `searchQuery`.
     * The search is case-insensitive and checks relevant fields.
     * (Note: Sorting is applied directly to `this.drivers` by the `sortDrivers` method).
     * @returns {Array<object>} Filtered list of driver entries.
     */
    filteredDrivers() {
      // The `drivers` array is already sorted by `sortDrivers` method.
      if (!this.searchQuery) {
        return this.drivers;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.drivers.filter((driver) =>
          [
            driver.uuid?.toLowerCase(), // Search by UUID
            driver.firstName?.toLowerCase(),
            driver.lastName?.toLowerCase(),
            driver.licenseCode?.toLowerCase(),
          ].some((field) => field?.includes(query))
      );
    },
  },
  /**
   * Lifecycle hook called when the component is created.
   * Fetches the initial list of drivers.
   */
  created() {
    this.fetchDrivers();
  },
  methods: {
    /**
     * Fetches driver records from the admin API.
     * Initializes `editing: false` and `editable: null` for each driver.
     * Populates `originalDrivers` for edit cancellation. Handles loading and feedback.
     * @async
     * @returns {void}
     */
    async fetchDrivers() {
      this.loading = true;
      try {
        // Manual Authorization header removed.
        const response = await api.get("/api/v1/admin/drivers");
        const { data, errors, status } = response.data || {};

        if (response.status === 204 || (status === "success" && (!data || data.length === 0))) {
          this.drivers = [];
          this.originalDrivers = [];
          // Removed: this.showSuccessModal("No drivers found.");
        } else if (status === "success" && Array.isArray(data)) {
          this.drivers = data.map((driver) => ({
            ...driver, // Assuming driver object from API has uuid, firstName, lastName, licenseCode
            editing: false,
            editable: null, // For storing temporary edits
          }));
          this.originalDrivers = JSON.parse(JSON.stringify(this.drivers));
          this.sortDrivers(this.sortKey, true); // Apply initial sort
        } else {
          throw new Error(errors?.map(e=>e.message).join(", ") || "Invalid API response while fetching drivers.");
        }
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || error.message || "Failed to fetch drivers.");
        console.error("Error fetching drivers:", error.response || error);
        this.drivers = [];
        this.originalDrivers = [];
        if (error.response?.status === 401) {
          this.$router.push("/login"); // Consider global auth handler
        }
      } finally {
        this.loading = false;
      }
    },
    /**
     * Sorts the `drivers` array directly based on the provided key and current `sortOrder`.
     * Handles nested properties if `key` is a dot-separated path.
     * @param {string} key - The property key to sort by.
     * @param {boolean} [initialSort=false] - If true, sorts using current sortOrder without toggling.
     * @returns {void}
     */
    sortDrivers(key, initialSort = false) {
      if (!initialSort) {
        if (this.sortKey === key) {
          this.sortOrder *= -1;
        } else {
          this.sortKey = key;
          this.sortOrder = 1;
        }
      }
      const getValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj) || "";
      this.drivers.sort((a, b) => {
        const valA = getValue(a, this.sortKey);
        const valB = getValue(b, this.sortKey);
        let comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        return comparison * this.sortOrder;
      });
    },
    /**
     * Initiates the deletion of a driver. Sets `driverToDelete` and shows confirmation modal.
     * @param {object} driver - The driver object to delete.
     * @returns {void}
     */
    initiateDeleteDriver(driver) {
      this.driverToDelete = driver;
      this.showConfirmationModal = true;
    },
    /**
     * Executes deletion of `driverToDelete` after user confirmation.
     * Calls API and refreshes list on success. Manages loading and feedback.
     * @async
     * @returns {void}
     */
    async confirmDeleteDriver() {
      if (this.driverToDelete?.uuid) {
        this.loading = true;
        try {
          // Manual Authorization header removed.
          const response = await api.delete(`/api/v1/admin/drivers/${this.driverToDelete.uuid}`);
          // For DELETE, typically expect 200 OK or 204 No Content on success
          if (response.status === 200 || response.status === 204 || response.data?.status === "success") {
            this.showSuccessModal("Driver deleted successfully.");
            await this.fetchDrivers();
          } else {
             throw new Error(response.data?.errors?.map(e => e.message).join(", ") || `Delete operation responded with status: ${response.status}`);
          }
        } catch (error) {
          this.showFailureModal(error.response?.data?.message || error.message || "Failed to delete driver.");
          console.error("Error deleting driver:", error.response || error);
        } finally {
          this.loading = false;
          this.showConfirmationModal = false;
          this.driverToDelete = null;
        }
      } else {
        this.showConfirmationModal = false;
        this.driverToDelete = null;
      }
    },
    /** Cancels deletion and hides confirmation modal. */
    cancelDeleteDriver() { this.driverToDelete = null; this.showConfirmationModal = false; },
    /**
     * Enables inline editing for a driver. Initializes `driver.editable` with current values.
     * @param {object} driver - The driver object to edit.
     * @returns {void}
     */
    editDriver(driver) {
      driver.editable = { // Initialize editable fields
        firstName: driver.firstName,
        lastName: driver.lastName,
        licenseCode: driver.licenseCode,
      };
      driver.editing = true;
    },
    /**
     * Saves changes to an edited driver. Validates required fields and PUTs data to API.
     * Refreshes list on success.
     * @param {object} driver - The driver object with updated data in its `editable` property.
     * @async
     * @returns {void}
     */
    async saveDriver(driver) {
      if (!driver.editable.firstName || !driver.editable.lastName || !driver.editable.licenseCode) {
        this.showFailureModal("First Name, Last Name, and License Code are required.");
        return;
      }
      this.loading = true;
      const payload = { // Construct payload from editable fields
        firstName: driver.editable.firstName,
        lastName: driver.editable.lastName,
        licenseCode: driver.editable.licenseCode,
        // Do not send driver.uuid in payload if it's part of URL and DTO doesn't expect it
      };
      try {
        // Manual Authorization header removed.
        const response = await api.put(`/api/v1/admin/drivers/${driver.uuid}`, payload);
        if (response.data?.status === "success") {
          this.showSuccessModal("Driver updated successfully.");
          driver.editing = false; // Turn off editing mode
          driver.editable = null; // Clear editable data
          await this.fetchDrivers(); // Refresh list
        } else {
          throw new Error(response.data?.errors?.map(e => e.message).join(", ") || "Failed to update driver: Server error.");
        }
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || error.message || "Failed to update driver.");
        console.error("Error updating driver:", error.response || error);
        // Optionally keep editing mode: driver.editing = true;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Cancels inline editing for a driver, reverting changes from `originalDrivers`.
     * @param {object} driver - The driver object being edited.
     * @returns {void}
     */
    cancelEdit(driver) {
      const original = this.originalDrivers.find((d) => d.uuid === driver.uuid);
      if (original) {
        Object.assign(driver, original); // Revert data
        driver.editing = false; // Ensure editing flag is also reset from original
        driver.editable = null;
      } else {
         driver.editing = false;
         driver.editable = null;
         // this.fetchDrivers(); // Fallback if original not found
      }
    },
    /**
     * Navigates to a detailed view page for a specific driver.
     * @param {string} driverUuid - The UUID of the driver to view.
     * @returns {void}
     */
    openDriverView(driverUuid) { // Changed param to uuid
      this.$router.push({ name: 'ViewDriver', params: { uuid: driverUuid } }); // Ensure 'AdminViewDriver' route name
    },
    /** Resets search query, triggering re-filter of the displayed list. */
    resetSearch() { this.searchQuery = ""; /* filteredDrivers will update */ },
    /** Navigates back in router history. */
    goBack() { this.$router.go(-1); },
    /** Shows success modal. @param {string} message */
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    /** Shows failure modal. @param {string} message */
    showFailureModal(message) { this.failModal = { show: true, message }; },
    /** Closes active success or failure modals. */
    closeModal() { this.successModal.show = false; this.failModal.show = false; },
  },
};
</script>

<style scoped>

</style>