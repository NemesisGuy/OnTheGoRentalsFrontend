<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-info-circle" aria-hidden="true"></i>
        About Us Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" @input="applyFiltersAndSort" placeholder="Search..." type="text"/> <!-- Added @input -->
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-times"></i> Reset <!-- Changed icon to reset -->
            </button>
          </div>
          <router-link class="add-button button" to="/admin/aboutUs/create">
            <i class="fa fa-plus-circle"></i> Add About Details <!-- Changed icon -->
          </router-link>
        </div>
      </div>
    </div>

    <!-- Shimmer Table Placeholder -->
    <ShimmerAdminTable v-if="loading && allAboutUsEntries.length === 0" :rows="1" :columns="7"/>

    <div v-if="!loading && aboutUsToDisplay.length === 0 && !apiError" class="no-data-message">
      No "About Us" entries found. Click "Add About Details" to create one.
    </div>
    <div v-if="apiError && !loading" class="no-data-message error-text">
      {{ failModal.message || "Failed to load About Us entries." }}
    </div>


    <table v-if="!loading && aboutUsToDisplay.length > 0">
      <thead>
      <tr>
        <th @click="sortAboutUsEntries('uuid')">Entry UUID <i class="fas fa-sort"></i></th> <!-- Changed from ID to UUID -->
        <th @click="sortAboutUsEntries('address')">Address <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUsEntries('officeHours')">Office Hours <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUsEntries('email')">Email <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUsEntries('telephone')">Telephone <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUsEntries('whatsApp')">WhatsApp <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody> <!-- Removed v-if here, table itself is conditional -->
      <tr v-for="about in aboutUsToDisplay" :key="about.uuid">
        <!-- Display UUID (shortened) -->
        <td>{{ about.uuid ? about.uuid.substring(0, 8) + '...' : 'N/A' }}</td>

        <td v-if="!about.editing">{{ about.address }}</td>
        <td v-else>
          <input v-model="about.editable.address" class="form-control-inline" type="text">
        </td>

        <td v-if="!about.editing">{{ about.officeHours }}</td>
        <td v-else>
          <input v-model="about.editable.officeHours" class="form-control-inline" type="text">
        </td>

        <td v-if="!about.editing">{{ about.email }}</td>
        <td v-else>
          <input v-model="about.editable.email" class="form-control-inline" type="email"> <!-- Type email for validation -->
        </td>

        <td v-if="!about.editing">{{ about.telephone }}</td>
        <td v-else>
          <input v-model="about.editable.telephone" class="form-control-inline" type="tel"> <!-- Type tel for validation -->
        </td>

        <td v-if="!about.editing">{{ about.whatsApp }}</td>
        <td v-else>
          <input v-model="about.editable.whatsApp" class="form-control-inline" type="tel"> <!-- Type tel for validation -->
        </td>

        <td class="actions-cell"> <!-- Class for consistent styling -->
          <div v-if="!about.editing">
            <button class="delete-button button" @click="initiateDeleteAboutUs(about)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="startEditAboutUs(about)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="viewAboutUsEntry(about.uuid)">
              <i class="fas fa-eye"></i> View
            </button>
          </div>
          <template v-else>
            <!-- Changed from confirmSaveAboutUs to executeSaveAboutUs to directly save -->
            <button class="save-button button" @click="executeSaveAboutUs(about)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="cancel-button button" @click="cancelEditAboutUs(about)"> <!-- Changed from back-button -->
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <!-- Moved loading text outside table for better visibility -->
    <div v-if="loading && allAboutUsEntries.length > 0" class="loading-overlay">Loading more entries...</div>

    <LoadingModal v-if="showSubmittingModal" :show="true" message="Submitting..."/> <!-- Separate modal for submitting -->

    <ConfirmationModal
        :show="showDeleteConfirmationModal"
        title="Confirm Deletion"
        @cancel="cancelDeleteAboutUs"
        @confirm="executeConfirmDeleteAboutUs"
    >
      <template #default v-if="entryToDelete"> <!-- Changed from aboutToBeDeletedId -->
        <div>
          <p>Are you sure you want to delete the following About Us entry?</p>
          <hr>
          <p><strong>UUID:</strong> {{ entryToDelete.uuid ? entryToDelete.uuid.substring(0,8) + '...' : 'N/A' }}</p>
          <p><strong>Address:</strong> {{ entryToDelete.address }}</p>
          <p><strong>Email:</strong> {{ entryToDelete.email }}</p>
          <hr>
          <p><b>Warning!</b> This action will soft-delete the entry and cannot be easily undone through the UI.</p>
        </div>
      </template>
    </ConfirmationModal>

    <!-- Removed save confirmation modal as save is now direct -->

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModal"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeModal"/>
  </div>
</template>

<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ShimmerAdminTable from "@/components/Main/Loaders/ShimmerAdminTable.vue";
import api from "@/api.js";

export default {
  name: "AboutUsManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
    ShimmerAdminTable,
  },
  data() {
    return {
      allAboutUsEntries: [],
      aboutUsToDisplay: [],
      searchQuery: "",
      loading: true,
      showSubmittingModal: false, // For create/update/delete operations
      apiError: false,
      showDeleteConfirmationModal: false,
      // showSaveConfirmationModal: false, // Removed as save is direct
      entryToDelete: null,
      // entryToSave: null, // Removed, using 'about' parameter directly in executeSaveAboutUs
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'email', // Default sort
      currentSortDirection: 'asc',
    };
  },
  methods: {
    fetchAboutUsEntries() {
      this.loading = true;
      this.apiError = false;
      // this.failModal.show = false; // Resetting directly in error handlers
      console.log("AboutUsManagement: Fetching About Us entries...");
      api.get('/api/v1/admin/about-us')
          .then(response => {
            console.log("AboutUsManagement - API Response:", response);
            if (response.data && response.data.status === "success") {
              const rawData = response.data.data;
              this.allAboutUsEntries = Array.isArray(rawData) ? rawData.map(entry => ({
                ...entry,
                editing: false,
                editable: null // Initialize editable structure
              })) : [];
            } else if (response.status === 204 || (response.data && Array.isArray(response.data.data) && response.data.data.length === 0)) {
              console.info("AboutUsManagement: No About Us entries found or list is empty.");
              this.allAboutUsEntries = [];
            }
            else {
              this.handleApiResponseError(response.data, "Failed to fetch About Us entries: Invalid API response.");
              this.allAboutUsEntries = [];
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "An error occurred while fetching About Us entries.");
            this.allAboutUsEntries = [];
          })
          .finally(() => {
            this.applyFiltersAndSort(); // Apply filters and sort even if list is empty
            this.loading = false;
            console.debug("AdminAboutUsManagement: fetchAboutUsEntries finished.");
          });
    },

    getPropertyValue(object, key) {
      if (object == null || typeof key !== 'string') return '';
      // For nested properties if needed in future, e.g., 'user.name'
      // const keys = key.split('.');
      // let value = object;
      // for (const k of keys) { if (value && k in value) value = value[k]; else return ''; }
      // return value === null || typeof value === 'undefined' ? '' : value;
      const value = object[key];
      return value === null || typeof value === 'undefined' ? '' : value;
    },

    applyFiltersAndSort() {
      let processedList = [...this.allAboutUsEntries];
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const lowerQuery = this.searchQuery.toLowerCase().trim();
        processedList = processedList.filter(entry =>
            Object.keys(entry).some(key => {
              // Exclude 'editable' and 'editing' from search
              if (key === 'editable' || key === 'editing') return false;
              const value = String(entry[key]).toLowerCase();
              return value.includes(lowerQuery);
            })
        );
      }
      this.sortList(processedList);
    },

    sortList(listToSort) {
      if (this.currentSortColumn) {
        listToSort.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.currentSortColumn);
          let valB = this.getPropertyValue(b, this.currentSortColumn);
          // Basic string comparison, can be enhanced for numeric/date
          let comparison = String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' });
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.aboutUsToDisplay = listToSort;
    },

    sortAboutUsEntries(sortKey) { // Renamed from sortAboutUs
      if (this.currentSortColumn === sortKey) {
        this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSortColumn = sortKey;
        this.currentSortDirection = 'asc';
      }
      this.applyFiltersAndSort();
    },

    resetSearch() {
      this.searchQuery = "";
      this.applyFiltersAndSort();
    },

    initiateDeleteAboutUs(aboutEntry) {
      this.entryToDelete = { ...aboutEntry }; // Store a copy
      this.showDeleteConfirmationModal = true;
    },

    executeConfirmDeleteAboutUs() { // Renamed from executeDeleteAboutUs for clarity
      if (!this.entryToDelete || !this.entryToDelete.uuid) {
        this.showDeleteConfirmationModal = false;
        this.entryToDelete = null;
        return;
      }
      this.showSubmittingModal = true; // Show submitting modal
      this.showDeleteConfirmationModal = false;

      api.delete(`/api/v1/admin/about-us/${this.entryToDelete.uuid}`)
          .then(() => { // Assuming 204 No Content on successful delete
            this.showSuccessModal("About Us entry deleted successfully.");
            this.fetchAboutUsEntries(); // Refresh list
          })
          .catch(error => {
            this.handleApiCatchError(error, "Failed to delete About Us entry.");
          })
          .finally(() => {
            this.showSubmittingModal = false;
            this.entryToDelete = null;
          });
    },

    cancelDeleteAboutUs() {
      this.entryToDelete = null;
      this.showDeleteConfirmationModal = false;
    },

    startEditAboutUs(aboutEntry) {
      // Deep copy for 'editable' to avoid modifying original data directly during edit
      aboutEntry.editable = JSON.parse(JSON.stringify({
        address: aboutEntry.address,
        officeHours: aboutEntry.officeHours,
        email: aboutEntry.email,
        telephone: aboutEntry.telephone,
        whatsApp: aboutEntry.whatsApp,
      }));
      aboutEntry.editing = true;
    },

    executeSaveAboutUs(aboutEntry) { // 'aboutEntry' is the item from the display list
      console.log("Executing save for About Us entry:", JSON.parse(JSON.stringify(aboutEntry.editable)));
      if (!aboutEntry || !aboutEntry.editable || !aboutEntry.uuid) {
        console.error("Save aborted: aboutEntry, its editable property, or UUID is missing.");
        this.showFailureModal("Cannot save: Data is missing."); // Show failure
        return;
      }
      this.showSubmittingModal = true;

      // Payload should match AboutUsUpdateDTO using the edited values
      const updatePayload = {
        address: aboutEntry.editable.address,
        officeHours: aboutEntry.editable.officeHours,
        email: aboutEntry.editable.email,
        telephone: aboutEntry.editable.telephone,
        whatsApp: aboutEntry.editable.whatsApp,
      };
      console.log("Payload for About Us update for UUID", aboutEntry.uuid, ":", updatePayload);

      api.put(`/api/v1/admin/about-us/${aboutEntry.uuid}`, updatePayload)
          .then(response => {
            if (response.data && response.data.status === "success") {
              this.showSuccessModal("About Us details updated successfully.");
              // Option 1: Refresh the whole list (simpler, ensures consistency)
              this.fetchAboutUsEntries();

              // Option 2: Update local item (faster, but more complex if sorting/filtering active)
              // const index = this.allAboutUsEntries.findIndex(item => item.uuid === aboutEntry.uuid);
              // if (index !== -1) {
              //   // Merge updated data back into the main list item
              //   Object.assign(this.allAboutUsEntries[index], response.data.data); // Assuming response.data.data is the updated AboutUsDTO
              //   this.allAboutUsEntries[index].editing = false;
              //   this.allAboutUsEntries[index].editable = null;
              //   this.applyFiltersAndSort(); // Re-apply to reflect changes in displayed list
              // } else {
              //   this.fetchAboutUsEntries(); // Fallback if not found
              // }
            } else {
              this.handleApiResponseError(response.data, "Failed to update details: Server responded with an error.");
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "Failed to update About Us details.");
            // Optionally revert editing state on error if needed
            // const originalEntry = this.allAboutUsEntries.find(item => item.uuid === aboutEntry.uuid);
            // if (originalEntry) {
            //   originalEntry.editing = false;
            //   originalEntry.editable = null;
            // }
          })
          .finally(() => {
            this.showSubmittingModal = false;
            // No longer using this.entryToSave, state is on aboutEntry directly
          });
    },

    cancelEditAboutUs(aboutEntry) {
      aboutEntry.editing = false;
      aboutEntry.editable = null; // Discard changes by resetting editable
      // No need to re-fetch, just revert UI state
    },

    viewAboutUsEntry(uuid) {
      this.$router.push({ name: 'ViewAboutUs', params: { uuid: uuid } });
    },

    showSuccessModal(message) {
      this.successModal.message = message;
      this.successModal.show = true;
    },
    closeModal() { // Unified close for success/failure modals
      this.successModal.show = false;
      this.failModal.show = false;
    },
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData && typeof responseData === 'string' && responseData.length < 200) { // Plain string error
        errorMsg = responseData;
      } else if (responseData && responseData.message) { // Simple message object
        errorMsg = responseData.message;
      }
      console.error("API Response Error (AboutUs Management):", responseData, "Generated Message:", errorMsg);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
      this.apiError = true;
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AboutUs Management):", error, "Response:", error.response);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.status) {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request && !error.response) { // Request made but no response received
        errorMessage = "No response from server. Please check your network connection.";
      } else if (error.message) { // Other JS errors
        errorMessage = error.message;
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
      this.apiError = true;
    },
  },
  created() {
    this.fetchAboutUsEntries();
  },
};
</script>


<!--

<style scoped>
/* Basic styling for content organization */
.content-container {
  padding: 20px;
  color: black;
  background-color: #f9f9f9; /* Light background for the whole page */
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee; /* Separator line */
}

.content-header h1 {
  font-size: 1.8em;
  color: #333;
  margin: 0;
}
.content-header h1 i {
  margin-right: 10px;
  color: #007bff; /* Icon color */
}

/* Search bar styling */
.search-bar-container {
  display: flex;
  justify-content: flex-end; /* Align search to the right */
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between input and button */
}

.search-input {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden; /* To contain the button within rounded corners */
}

.search-input input[type="text"] {
  padding: 10px;
  border: none; /* Remove default border */
  outline: none;
  font-size: 1em;
  flex-grow: 1; /* Allow input to take available space */
}
.search-input input[type="text"]::placeholder {
  color: #aaa;
}

/* General button styling */
.button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  text-decoration: none; /* For router-link */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px; /* Space between icon and text */
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Subtle shadow */
}
.button:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15); /* Enhanced shadow on hover */
}
.button i {
  font-size: 1em; /* Ensure icon size matches text */
}


/* Specific button colors */
.add-button {
  background-color: #28a745; /* Green */
  color: white;
}
.add-button:hover { background-color: #218838; }

.read-button { /* Used for Reset and View */
  background-color: #17a2b8; /* Info Blue */
  color: white;
}
.read-button:hover { background-color: #138496; }

/* Adjusting reset button to be part of input group visually */
.search-input .read-button {
  border-radius: 0; /* Remove individual border radius */
  border-left: 1px solid #ccc; /* Separator line */
  box-shadow: none;
}
.search-input .read-button:hover {
  background-color: #138496; /* Consistent hover */
}


/* Table styling */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  border-radius: 5px;
  overflow: hidden; /* Ensures border-radius is respected by children */
}

th, td {
  border: 1px solid #ddd;
  padding: 12px; /* Increased padding */
  text-align: left;
  vertical-align: middle; /* Better alignment for multi-line content */
  word-break: break-word; /* Prevent long strings from breaking layout */
}

th {
  background-color: #007bff; /* Primary blue for headers */
  color: white;
  cursor: pointer;
  font-weight: bold; /* Make header text bolder */
  text-transform: uppercase; /* Uppercase header text */
  letter-spacing: 0.5px; /* Slight letter spacing */
}
th i.fa-sort {
  margin-left: 5px;
  opacity: 0.7;
}
th:hover i.fa-sort {
  opacity: 1;
}


tbody tr:nth-child(even) {
  background-color: #f9f9f9; /* Zebra striping for even rows */
}
tbody tr:hover {
  background-color: #f1f1f1; /* Hover effect for rows */
}

/* Inline form controls styling */
.form-control-inline {
  width: 100%; /* Make input take full width of td */
  padding: 8px;
  margin: 0; /* Remove default margins if any */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
}
.form-control-inline:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  outline: none;
}


/* Actions column and cell styling */
.actions-column {
  width: auto; /* Adjust based on number of buttons */
  min-width: 240px; /* Ensure enough space for buttons */
  text-align: center;
}
.actions-cell {
  text-align: center;
  white-space: nowrap; /* Prevent buttons from wrapping */
}
.actions-cell .button {
  margin: 2px 3px; /* Spacing between buttons */
  padding: 6px 10px;
  font-size: 0.85em;
}

.update-button { background-color: #ffc107; color: #212529; } /* Yellow */
.update-button:hover { background-color: #e0a800; }
.delete-button { background-color: #dc3545; color: white; } /* Red */
.delete-button:hover { background-color: #c82333; }
.save-button { background-color: #28a745; color: white; } /* Green */
.save-button:hover { background-color: #218838; }
.cancel-button { background-color: #6c757d; color: white; } /* Gray */
.cancel-button:hover { background-color: #5a6268; }
.back-button { /* Added for consistency if used */
  background-color: #6c757d;
  color: black;
}
.back-button:hover { background-color: #5a6268; }



/* No data / Error message styling */
.no-data-message {
  text-align: center;
  padding: 40px 20px;
  font-size: 1.2em;
  color: #666;
  background-color: white;
  margin-top: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}
.error-text {
  color: #dc3545; /* Red for errors */
  font-weight: bold;
}

/* Loading indicators */
.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #555;
}
.loading-overlay { /* For when table has data but more is loading */
  text-align: center;
  padding: 10px;
  font-style: italic;
  color: #000;
  background-color: rgba(255, 255, 255, 0.8);
}

</style>

-->
