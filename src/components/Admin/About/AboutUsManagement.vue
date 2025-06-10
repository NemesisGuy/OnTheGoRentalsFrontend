<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-info-circle" aria-hidden="true"></i>
        About Us Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-search"> </i> Reset
            </button>
          </div>
          <router-link class="add-button button" to="/admin/aboutUs/create">
            <i class="fa fa-info-circle"></i> Add About Details
          </router-link>
        </div>
      </div>

    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortAboutUs('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('address')">Address <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('officeHours')">Office Hours <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('email')">Email <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('telephone')">Telephone Number <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('whatsApp')">WhatsApp Number <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="about in aboutUsToDisplay" :key="about.uuid">
        <td v-if="!about.editing">{{ about.uuid }}</td>
        <td v-else>
          <input v-model="about.uuid" disabled type="text">
        </td>

        <td v-if="!about.editing">{{ about.address }}</td>
        <td v-else>
          <input v-model="about.address" type="text">
        </td>

        <td v-if="!about.editing">{{ about.officeHours }}</td>
        <td v-else>
          <input v-model="about.officeHours" type="text">
        </td>

        <td v-if="!about.editing">{{ about.email }}</td>
        <td v-else>
          <input v-model="about.email" type="text">
        </td>

        <td v-if="!about.editing">{{ about.telephone }}</td>
        <td v-else>
          <input v-model="about.telephone" type="text">
        </td>

        <td v-if="!about.editing">{{ about.whatsApp }}</td>
        <td v-else>
          <input v-model="about.whatsApp" type="text">
        </td>

        <td>
          <div v-if="!about.editing">
            <button class="delete-button button" @click="initiateDeleteAboutUs(about)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="startEditAboutUs(about)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="viewAboutUsEntry(about.uuid)">
              <i class="fas fa-eye"></i> Read
            </button>
          </div>
          <template v-else>
            <button class="update-button button" @click="executeSaveAboutUs(about)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="back-button button" @click="cancelEditAboutUs(about)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
    <confirmation-modal
        :show="showDeleteConfirmationModal"
        @cancel="cancelDeleteAboutUs"
        @confirm="executeConfirmDeleteAboutUs"
    >
      <template v-if="aboutToBeDeletedId">
        <div>
          <p>Are you sure you want to delete the following?</p>
          <hr>
          <p>About ID: {{ aboutToBeDeletedId.uuid }}</p>
          <p>Address: {{ aboutToBeDeletedId.address }}</p>
          <p>Email: {{ aboutToBeDeletedId.email }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show"
                  @cancel="closeModal"
                  @close="closeModal"></SuccessModal>
    <FailureModal v-if="failModal.show" :message="failModal.message" :show="failModal.show" @cancel="closeModal"
                  @close="closeModal"></FailureModal>
  </div>
</template>
<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ShimmerAdminTable from "@/components/Main/Loaders/ShimmerAdminTable.vue"; // Note: Imported but not used in the current template.
import api from "@/api.js";

/**
 * @file AboutUsManagement.vue
 * @description Component for managing "About Us" entries in the admin section.
 * It allows viewing, creating (via navigation), editing (inline), deleting, searching,
 * and sorting of "About Us" information.
 * @component AboutUsManagement
 */
export default {
  name: "AboutUsManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
    ShimmerAdminTable, // Note: Not actively used in the template. Loading is handled by LoadingModal and text.
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} allAboutUsEntries - Stores all fetched "About Us" entries. Each entry is augmented with `editing` and `editable` fields for UI state.
   * @property {Array<object>} aboutUsToDisplay - The filtered and sorted list of "About Us" entries to display in the table.
   * @property {string} searchQuery - The current search query string for filtering entries.
   * @property {boolean} loading - Flag indicating if data is being fetched or an operation is in progress.
   * @property {boolean} apiError - Flag indicating if a generic API error occurred (used by error handlers).
   * @property {boolean} showDeleteConfirmationModal - Controls visibility of the delete confirmation modal.
   * @property {boolean} showSaveConfirmationModal - Controls visibility of a save confirmation modal (Note: Methods exist but not directly wired in template).
   * @property {object|null} entryToDelete - Stores the "About Us" entry object marked for deletion.
   * @property {object|null} entryToSave - Stores the "About Us" entry object marked for saving (Note: Methods exist but not directly wired in template for confirmation step).
   * @property {object} successModal - Controls the success modal.
   * @property {boolean} successModal.show - Visibility of success modal.
   * @property {string} successModal.message - Message for success modal.
   * @property {object} failModal - Controls the failure modal.
   * @property {boolean} failModal.show - Visibility of failure modal.
   * @property {string} failModal.message - Message for failure modal.
   * @property {string} currentSortColumn - The key of the entry property currently used for sorting.
   * @property {string} currentSortDirection - The current direction of sorting ('asc' or 'desc').
   */
  data() {
    return {
      allAboutUsEntries: [],
      aboutUsToDisplay: [],
      searchQuery: "",
      loading: true, // Start with loading true as data is fetched on created
      apiError: false,
      showDeleteConfirmationModal: false,
      showSaveConfirmationModal: false, // Added for completeness as methods use it
      entryToDelete: null,
      entryToSave: null, // Added for completeness as methods use it
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'email', // Default sort column
      currentSortDirection: 'asc', // Default sort direction
    };
  },
  /**
   * Lifecycle hook called when the component is created.
   * Fetches the initial list of "About Us" entries.
   */
  created() {
    this.fetchAboutUsEntries();
  },
  methods: {
    /**
     * Fetches all "About Us" entries from the backend API.
     * Augments each entry with `editing` (boolean) and `editable` (null or object) properties for UI state management.
     * Calls `applyFiltersAndSort` after fetching. Handles loading and error states.
     * @async
     * @returns {void}
     */
    async fetchAboutUsEntries() {
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false;
      console.log("AboutUsManagement: Fetching About Us entries...");
      try {
        const response = await api.get('/api/v1/admin/about-us');
        console.log("AboutUsManagement - API Response:", response);

        if (response.data && response.data.status === "success") {
          const rawData = response.data.data;
          this.allAboutUsEntries = Array.isArray(rawData) ? rawData.map(entry => ({
            ...entry,
            editing: false,
            editable: null
          })) : [];
          this.applyFiltersAndSort();
        } else {
          this.handleApiResponseError(response.data, "Failed to fetch About Us entries.");
          this.allAboutUsEntries = [];
          this.applyFiltersAndSort();
        }
      } catch (error) {
        this.handleApiCatchError(error, "Failed to fetch About Us entries. Please try again.");
        this.allAboutUsEntries = [];
        this.applyFiltersAndSort();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Safely gets a property value from an object, returning an empty string if null/undefined.
     * @param {object|null} object - The object to get the property from.
     * @param {string} key - The key of the property.
     * @returns {string|any} The property value or an empty string.
     */
    getPropertyValue(object, key) {
      if (object == null || typeof key !== 'string') return '';
      return object[key] === null || typeof object[key] === 'undefined' ? '' : object[key];
    },

    /**
     * Applies current search filters and sorting to the `allAboutUsEntries` list
     * and updates `aboutUsToDisplay`.
     * @returns {void}
     */
    applyFiltersAndSort() {
      let processedList = [...this.allAboutUsEntries];
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const lowerQuery = this.searchQuery.toLowerCase().trim();
        processedList = processedList.filter(entry =>
            // Check all relevant string fields for the search query
            ['address', 'officeHours', 'email', 'telephone', 'whatsApp', 'uuid'].some(key =>
                String(this.getPropertyValue(entry, key)).toLowerCase().includes(lowerQuery)
            )
        );
      }
      this.sortList(processedList); // Pass the filtered list to be sorted
    },

    /**
     * Sorts a given list of entries based on `currentSortColumn` and `currentSortDirection`.
     * Updates `aboutUsToDisplay` with the sorted list.
     * @param {Array<object>} listToSort - The list of "About Us" entries to sort.
     * @returns {void}
     */
    sortList(listToSort) {
      if (this.currentSortColumn) {
        listToSort.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.currentSortColumn);
          let valB = this.getPropertyValue(b, this.currentSortColumn);
          // Ensure consistent string comparison
          let comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.aboutUsToDisplay = listToSort;
    },

    /**
     * Sets the sort column and direction for the "About Us" table and re-applies filtering/sorting.
     * (Note: Template uses `@click="sortAboutUs('columnKey')"`, this method is `sortAboutUs` in script).
     * This JSDoc assumes the method name `sortAboutUs` as per template usage for clarity.
     * @param {string} sortKey - The key of the entry property to sort by.
     * @returns {void}
     */
    sortAboutUs(sortKey) { // Renamed from sortAboutUsEntries to match template usage
      if (this.currentSortColumn === sortKey) {
        this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSortColumn = sortKey;
        this.currentSortDirection = 'asc';
      }
      this.applyFiltersAndSort();
    },

    /**
     * Resets the search query and re-applies filters and sorting to display all entries.
     * @returns {void}
     */
    resetSearch() {
      this.searchQuery = "";
      this.applyFiltersAndSort();
    },

    /**
     * Initiates the deletion process for an "About Us" entry by setting the entry to be deleted
     * and showing the delete confirmation modal.
     * @param {object} aboutEntry - The "About Us" entry object to delete.
     * @returns {void}
     */
    initiateDeleteAboutUs(aboutEntry) {
      this.entryToDelete = { ...aboutEntry }; // Clone to avoid issues if original is modified elsewhere
      this.showDeleteConfirmationModal = true;
    },

    /**
     * Executes the deletion of the "About Us" entry after user confirmation.
     * Makes an API call to delete the entry. Refreshes the list on success.
     * @async
     * @returns {void}
     */
    async executeConfirmDeleteAboutUs() {
      if (this.entryToDelete && this.entryToDelete.uuid) {
        this.loading = true;
        this.showDeleteConfirmationModal = false;
        try {
          await api.delete(`/api/v1/admin/about-us/${this.entryToDelete.uuid}`);
          this.showSuccessModal("About Us entry deleted successfully.");
          await this.fetchAboutUsEntries(); // Refresh the list
        } catch (error) {
          this.handleApiCatchError(error, "Failed to delete About Us entry.");
        } finally {
          this.loading = false;
          this.entryToDelete = null; // Reset
        }
      } else {
        console.warn("Delete confirmation executed without a valid entryToDelete or UUID.");
        this.showDeleteConfirmationModal = false; // Still hide modal
        this.entryToDelete = null; // Reset
      }
    },

    /**
     * Cancels the deletion process and hides the delete confirmation modal.
     * @returns {void}
     */
    cancelDeleteAboutUs() {
      this.entryToDelete = null;
      this.showDeleteConfirmationModal = false;
    },

    /**
     * Enables inline editing mode for an "About Us" entry.
     * It creates a temporary `editable` object on the entry to store changes before saving.
     * @param {object} aboutEntry - The "About Us" entry object to edit.
     * @returns {void}
     */
    startEditAboutUs(aboutEntry) {
      // Clone only the fields that are meant to be editable
      aboutEntry.editable = {
        address: aboutEntry.address,
        officeHours: aboutEntry.officeHours,
        email: aboutEntry.email,
        telephone: aboutEntry.telephone,
        whatsApp: aboutEntry.whatsApp,
      };
      aboutEntry.editing = true;
    },

    /**
     * (Note: This method exists but is not directly wired to a confirmation step in the template for saving.
     * `executeSaveAboutUs` is called directly. This method would typically show `showSaveConfirmationModal`.)
     * Sets the entry to be saved and shows a save confirmation modal.
     * @param {object} aboutEntry - The "About Us" entry with pending edits in its `editable` property.
     * @returns {void}
     */
    confirmSaveAboutUs(aboutEntry) {
      this.entryToSave = aboutEntry;
      this.showSaveConfirmationModal = true;
    },

    /**
     * (Note: This method exists but is not directly wired. See `confirmSaveAboutUs`.)
     * Cancels the save process from a confirmation modal.
     * @returns {void}
     */
    cancelSaveAboutUs() {
      this.entryToSave = null;
      this.showSaveConfirmationModal = false;
    },

    /**
     * Executes the saving of an edited "About Us" entry.
     * Makes a PUT API call with the data from the entry's `editable` property.
     * Refreshes the list on success.
     * @param {object} aboutEntry - The "About Us" entry object that has been edited (changes are in `aboutEntry.editable`).
     * @async
     * @returns {void}
     */
    async executeSaveAboutUs(aboutEntry) {
      console.log("Executing save for About Us entry:", aboutEntry);
      // `entryToSave` is not used here as `aboutEntry` is passed directly from the save button
      if (!aboutEntry || !aboutEntry.editable || !aboutEntry.uuid) {
        console.error("Save aborted: aboutEntry, its editable property, or UUID is missing.");
        this.failModal.message = "Cannot save: essential data is missing."; // Provide user feedback
        this.failModal.show = true;
        return;
      }
      // this.showSaveConfirmationModal = false; // Not used if no confirmation step for save
      this.loading = true;

      const updatePayload = { // Payload should match AboutUsUpdateDTO
        address: aboutEntry.editable.address,
        officeHours: aboutEntry.editable.officeHours,
        email: aboutEntry.editable.email,
        telephone: aboutEntry.editable.telephone,
        whatsApp: aboutEntry.editable.whatsApp,
      };
      console.log("Payload for About Us update for UUID", aboutEntry.uuid, ":", updatePayload);

      try {
        const response = await api.put(`/api/v1/admin/about-us/${aboutEntry.uuid}`, updatePayload);
        if (response.data && response.data.status === "success") {
          this.showSuccessModal("About Us details updated successfully.");
          // Refresh list to get latest data and reset editing states
          await this.fetchAboutUsEntries();
        } else {
          // If editing state needs to be preserved on API error, handle that here.
          // For now, re-fetching will reset it.
          this.handleApiResponseError(response.data, "Failed to update details: Server responded with an error.");
        }
      } catch (error) {
        // Similar to above, re-fetching will reset editing state.
        this.handleApiCatchError(error, "Failed to update About Us details.");
      } finally {
        this.loading = false;
        // `entryToSave` was not used in this direct execution flow.
        // If it were part of a confirm -> execute flow, it would be reset here.
      }
    },

    /**
     * Cancels the inline editing mode for an "About Us" entry.
     * Discards any changes made in the `editable` object and sets `editing` to false.
     * @param {object} aboutEntry - The "About Us" entry object.
     * @returns {void}
     */
    cancelEditAboutUs(aboutEntry) {
      aboutEntry.editing = false;
      aboutEntry.editable = null; // Discard changes by clearing the editable copy
    },

    /**
     * Navigates to a detailed view page for a specific "About Us" entry.
     * @param {string} uuid - The UUID of the "About Us" entry to view.
     * @returns {void}
     */
    viewAboutUsEntry(uuid) {
      // Ensure 'ViewAboutUs' is a valid route name and it expects 'uuid' as a param.
      this.$router.push({ name: 'ViewAboutUs', params: { uuid: uuid } });
    },

    /**
     * Helper method to show the success modal with a custom message.
     * @param {string} message - The message to display.
     * @returns {void}
     */
    showSuccessModal(message) {
      this.successModal.message = message;
      this.successModal.show = true;
    },
    /**
     * Closes the success modal.
     * @returns {void}
     */
    closeSuccessModal() {
      this.successModal.show = false;
    },
    /**
     * Closes the failure modal.
     * @returns {void}
     */
    closeFailureModal() {
      this.failModal.show = false;
    },
    /**
     * Closes any active feedback (success or failure) modals.
     * @returns {void}
     */
    closeModal() { // General close, can be called by modals if they don't need specific post-close actions
       this.successModal.show = false;
      this.failModal.show = false;
     },
    /**
     * Handles API response errors where the HTTP request itself was successful (e.g., 2xx status)
     * but the response body indicates an application-level error (e.g., { status: "error", errors: [...] }).
     * @param {object|null} responseData - The data part of the API response.
     * @param {string} defaultMessage - Default error message if a specific one cannot be extracted.
     * @returns {void}
     */
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData?.errors?.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData?.message) {
        errorMsg = responseData.message;
      } else if (typeof responseData === 'string' && responseData.length < 200 && responseData.length > 0) {
        errorMsg = responseData;
      }
      console.error("API Response Error (AboutUs Management):", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
      this.apiError = true; // Set general API error flag
    },
    /**
     * Handles errors caught by the `catch` block of an API call (e.g., network errors, HTTP error statuses like 4xx, 5xx).
     * @param {Error} error - The error object from the `catch` block.
     * @param {string} defaultMessage - Default error message if a specific one cannot be extracted.
     * @returns {void}
     */
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AboutUs Management):", error.response || error.message || error);
      let errorMessage = defaultMessage;
      if (error.response?.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors?.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200 && apiResponse.length > 0) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your network connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
      this.apiError = true; // Set general API error flag
    },
  },
  created() {
    this.fetchAboutUsEntries();
  },
};
</script>