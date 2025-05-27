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
      apiError: false,
      showDeleteConfirmationModal: false,
      showSaveConfirmationModal: false,
      entryToDelete: null,
      entryToSave: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'email',
      currentSortDirection: 'asc',
    };
  },
  methods: {
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

    getPropertyValue(object, key) {
      if (object == null || typeof key !== 'string') return '';
      return object[key] === null || typeof object[key] === 'undefined' ? '' : object[key];
    },

    applyFiltersAndSort() {
      let processedList = [...this.allAboutUsEntries];
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        processedList = processedList.filter(entry =>
            Object.values(entry).some(val =>
                String(val).toLowerCase().includes(lowerQuery)
            )
        );
      }
      this.sortList(processedList);
    },

    sortList(listToSort) {
      if (this.currentSortColumn) {
        listToSort.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.currentSortColumn);
          let valB = this.getPropertyValue(b, this.currentSortColumn);
          let comparison = String(valA).localeCompare(String(valB));
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.aboutUsToDisplay = listToSort;
    },

    sortAboutUsEntries(sortKey) {
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
      this.entryToDelete = { ...aboutEntry };
      this.showDeleteConfirmationModal = true;
    },

    async executeConfirmDeleteAboutUs() {
      if (this.entryToDelete && this.entryToDelete.uuid) {
        this.loading = true;
        this.showDeleteConfirmationModal = false;
        try {
          await api.delete(`/api/v1/admin/about-us/${this.entryToDelete.uuid}`);
          this.showSuccessModal("About Us entry deleted successfully.");
          await this.fetchAboutUsEntries();
        } catch (error) {
          this.handleApiCatchError(error, "Failed to delete About Us entry.");
        } finally {
          this.loading = false;
          this.entryToDelete = null;
        }
      } else {
        this.showDeleteConfirmationModal = false;
        this.entryToDelete = null;
      }
    },

    cancelDeleteAboutUs() {
      this.entryToDelete = null;
      this.showDeleteConfirmationModal = false;
    },

    startEditAboutUs(aboutEntry) {
      // Initialize 'editable' with fields from AboutUsUpdateDTO
      // Make sure to copy all fields that are present in AboutUsResponseDTO AND editable
      aboutEntry.editable = {
        address: aboutEntry.address,
        officeHours: aboutEntry.officeHours,
        email: aboutEntry.email,
        telephone: aboutEntry.telephone,
        whatsApp: aboutEntry.whatsApp,
      };
      aboutEntry.editing = true;
    },

    confirmSaveAboutUs(aboutEntry) {
      this.entryToSave = aboutEntry; // This is the item from the list, containing .uuid and .editable
      this.showSaveConfirmationModal = true;
    },

    cancelSaveAboutUs() {
      this.entryToSave = null;
      this.showSaveConfirmationModal = false;
    },

    async executeSaveAboutUs(about) {
      console.log("Executing save for About Us entry:", about);
      this.entryToSave = about; // This is the item from the list, containing .uuid and .editable
      if (!this.entryToSave || !this.entryToSave.editable || !this.entryToSave.uuid) {
        console.error("Save aborted: entryToSave, its editable property, or UUID is missing.");
        this.showSaveConfirmationModal = false;
        this.entryToSave = null; // Reset
        return;
      }
      this.showSaveConfirmationModal = false;
      this.loading = true;

      // Payload should match AboutUsUpdateDTO (which contains optional fields)
      const updatePayload = {
        address: this.entryToSave.editable.address,
        officeHours: this.entryToSave.editable.officeHours,
        email: this.entryToSave.editable.email,
        telephone: this.entryToSave.editable.telephone,
        whatsApp: this.entryToSave.editable.whatsApp,
      };
      console.log("Payload for About Us update for UUID", this.entryToSave.uuid, ":", updatePayload);

      try {
        // Admin endpoint uses UUID in path
        const response = await api.put(`/api/v1/admin/about-us/${this.entryToSave.uuid}`, updatePayload);

        if (response.data && response.data.status === "success") {
          this.showSuccessModal("About Us details updated successfully.");
          // No need to manually update allAboutUsEntries if getAbout is called
          // this.entryToSave.editing = false; // This would be done if not re-fetching
          // this.entryToSave.editable = null;
          await this.fetchAboutUsEntries(); // Refresh list to get latest data
        } else {
          this.handleApiResponseError(response.data, "Failed to update details: Server responded with an error.");
        }
      } catch (error) {
        this.handleApiCatchError(error, "Failed to update About Us details.");
      } finally {
        this.loading = false;
        this.entryToSave = null; // Reset after attempt
      }
    },

    cancelEditAboutUs(aboutEntry) {
      aboutEntry.editing = false;
      aboutEntry.editable = null; // Discard changes
    },

    viewAboutUsEntry(uuid) {
      // Assuming you have a route named 'AdminViewAboutUs' that takes 'aboutUsUuid'
      // If the param name is just 'uuid', then use { uuid: uuid }
      this.$router.push({ name: 'ViewAboutUs', params: { uuid: uuid } });
    },

    showSuccessModal(message) {
      this.successModal.message = message;
      this.successModal.show = true;
    },
    // showFailureModal(message) { // Replaced by helper methods below
    //   this.failModal.message = message;
    //   this.failModal.show = true;
    // },
    closeSuccessModal() { // This specific method is called by SuccessModal's @close
      this.successModal.show = false;
    },
    closeFailureModal() { // This specific method is called by FailureModal's @close
      this.failModal.show = false;
    },
    // General closeModal that your original template used for both, might not be needed if specific ones are used
    closeModal() {
       this.successModal.show = false;
      this.failModal.show = false;
     },
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData && typeof responseData === 'string' && responseData.length < 200) {
        errorMsg = responseData;
      } else if (responseData && responseData.message) {
        errorMsg = responseData.message;
      }
      console.error("API Response Error (AboutUs Management):", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
      this.apiError = true;
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AboutUs Management):", error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server.";
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