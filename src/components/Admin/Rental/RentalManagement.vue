<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-file-alt"></i> Rental Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" @input="applyFiltersAndSort" placeholder="Search by User, Car, Status..." type="text"/>
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-times"></i> Reset
            </button>
          </div>
          <router-link :to="{ name: 'CreateRental' }" class="add-button button">
            <i class="fas fa-plus-circle"></i> Add Rental
          </router-link>
        </div>
      </div>
    </div>

    <ShimmerAdminTable v-if="loading && allRentals.length === 0" :rows="10" :columns="11" />

    <div v-if="!loading && rentalsToDisplay.length === 0 && !apiError" class="no-data-message">
      No rentals found matching your criteria.
    </div>
    <div v-if="apiError && !loading" class="no-data-message error-text">
      {{ failModal.message || "Failed to load rentals." }}
    </div>

    <table v-if="!loading && rentalsToDisplay.length > 0">
      <thead>
      <tr>
        <th @click="sortRentalsBy('uuid')">Rental UUID <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('user.lastName')">User <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('car.make')">Car <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('driver.lastName')">Driver <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('issuer')">Issuer ID <i class="fas fa-sort"></i></th> <!-- Displaying rental.issuer -->
        <th @click="sortRentalsBy('issuedDate')">Issued Date <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('expectedReturnDate')">Expected Return <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('returnedDate')">Actual Return <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('receiver')">Receiver ID <i class="fas fa-sort"></i></th> <!-- Displaying rental.receiver -->
        <th @click="sortRentalsBy('status')">Status <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('fine')">Fine <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="rental in rentalsToDisplay" :key="rental.uuid">
        <td>{{ rental.uuid ? rental.uuid.substring(0, 8) + '...' : 'N/A' }}</td>

        <td v-if="!rental.editing">{{ rental.user ? `${rental.user.firstName} ${rental.user.lastName}` : 'N/A' }}</td>
        <td v-else><input v-model="rental.editable.userUuid" class="form-control-inline" placeholder="User UUID" type="text"></td>

        <td v-if="!rental.editing">{{ rental.car ? `${rental.car.make} ${rental.car.model}` : 'N/A' }}</td>
        <td v-else><input v-model="rental.editable.carUuid" class="form-control-inline" placeholder="Car UUID" type="text"></td>

        <td v-if="!rental.editing">{{ rental.driver ? `${rental.driver.firstName} ${rental.driver.lastName}` : 'N/A' }}</td>
        <td v-else><input v-model="rental.editable.driverUuid" class="form-control-inline" placeholder="Driver UUID" type="text"></td>

        <td v-if="!rental.editing">{{ rental.issuer != null ? (typeof rental.issuer === 'string' ? rental.issuer.substring(0,8) + '...' : rental.issuer) : 'N/A' }}</td>
        <td v-else><input type="text" v-model="rental.editable.issuer" class="form-control-inline" placeholder="Issuer UUID"></td>

        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.issuedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.issuedDate" class="form-control-inline"></td>

        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.expectedReturnDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.expectedReturnDate" class="form-control-inline"></td>

        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.returnedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.actualReturnedDate" class="form-control-inline"></td>

        <td v-if="!rental.editing">{{ rental.receiver != null ? (typeof rental.receiver === 'string' ? rental.receiver.substring(0,8) + '...' : rental.receiver) : 'N/A' }}</td>
        <td v-else><input type="text" v-model="rental.editable.receiver" class="form-control-inline" placeholder="Receiver UUID"></td>

        <td v-if="!rental.editing"><span :class="['status-badge', getStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></td>
        <td v-else>
          <select v-model="rental.editable.status" class="form-control-inline-select">
            <option v-for="statusOption in rentalStatusOptions" :key="statusOption" :value="statusOption">
              {{ formatStatus(statusOption) }}
            </option>
          </select>
        </td>

        <td v-if="!rental.editing">{{ rental.fine != null ? '$' + rental.fine.toFixed(2) : 'N/A' }}</td>
        <td v-else><input type="number" step="0.01" v-model.number="rental.editable.fine" class="form-control-inline"></td>

        <td class="actions-cell">
          <template v-if="!rental.editing">
            <button @click="viewRentalDetails(rental.uuid)" class="button read-button" title="View Details"><i class="fas fa-eye"></i>View</button>
            <button @click="startEditRental(rental)" class="button update-button" title="Edit Rental"><i class="fas fa-edit"></i>Edit</button>
            <button @click="initiateDeleteRental(rental)" class="button delete-button" title="Delete Rental"><i class="fas fa-trash"></i>Delete</button>
          </template>
          <template v-else>
            <button @click="confirmSaveRental(rental)" class="button save-button" title="Save Changes"><i class="fas fa-save"></i>Save</button>
            <button @click="cancelEditRental(rental)" class="button cancel-button" title="Cancel Edit"><i class="fas fa-times"></i>Cancel</button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <LoadingModal v-if="showSubmittingModal" :show="true" message="Submitting..."/>
  </div>

  <div class="modal-body-container">
    <ConfirmationModal
        key="rentalDeleteConfirmModal"
        :show="showDeleteConfirmationModal"
        title="Confirm Rental Deletion"
        @confirm="executeDeleteRental"
        @cancel="cancelDeleteRental"
    >
      <template #default v-if="rentalToDelete">
        <p>Are you sure you want to soft-delete this rental?</p>
        <hr>
        <p><strong>UUID:</strong> {{ rentalToDelete.uuid ? rentalToDelete.uuid.substring(0,8) : 'N/A' }}...</p>
        <p><strong>User:</strong> {{ rentalToDelete.user ? `${rentalToDelete.user.firstName} ${rentalToDelete.user.lastName}` : 'N/A' }}</p>
        <p><strong>Car:</strong> {{ rentalToDelete.car ? `${rentalToDelete.car.make} ${rentalToDelete.car.model}` : 'N/A' }}</p>
      </template>
    </ConfirmationModal>

    <ConfirmationModal
        key="rentalSaveConfirmModal"
        :show="showSaveConfirmationModal"
        title="Confirm Rental Update"
        @confirm="executeUpdateRental"
        @cancel="cancelSaveRental"
    >
      <template #default v-if="rentalToSave && rentalToSave.editable">
        <p>Save changes for rental UUID {{rentalToSave.uuid ? rentalToSave.uuid.substring(0,8) : 'N/A'}}...?</p>
        <hr>
        <!-- Display a summary of changes if needed, e.g., what is in rentalToSave.editable -->
        <p><strong>User UUID:</strong> {{ rentalToSave.editable.userUuid || 'N/A' }}</p>
        <p><strong>Car UUID:</strong> {{ rentalToSave.editable.carUuid || 'N/A' }}</p>
        <p><strong>Expected Return:</strong> {{ formatDisplayDateTime(rentalToSave.editable.expectedReturnDate) || 'N/A' }}</p>
        <p><strong>Status:</strong> {{ formatStatus(rentalToSave.editable.status) }}</p>
        <p><strong>Fine:</strong> {{ rentalToSave.editable.fine != null ? '$'+rentalToSave.editable.fine.toFixed(2) : 'N/A' }}</p>
      </template>
    </ConfirmationModal>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeSuccessModal"></SuccessModal>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFailModal"></FailureModal>
  </div>
</template>
<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ShimmerAdminTable from "@/components/Main/Loaders/ShimmerAdminTable.vue";
import api from "@/api.js";
import { formatDateTime } from '@/utils/dateUtils.js';

const RENTAL_STATUS_OPTIONS = ['ACTIVE', 'COMPLETED', 'CANCELLED'];


export default {
  name: "AdminRentalManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
    ShimmerAdminTable,
  },
  data() {
    return {
      allRentals: [],
      rentalsToDisplay: [],
      searchQuery: "",
      loading: true,
      showSubmittingModal: false,
      apiError: false,
      showDeleteConfirmationModal: false,
      showSaveConfirmationModal: false,
      rentalToDelete: null,
      rentalToSave: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'issuedDate',
      currentSortDirection: 'desc',
      rentalStatusOptions: RENTAL_STATUS_OPTIONS,
    };
  },
  methods: {
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString);
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-${status.toLowerCase().replace(/_/g, '-')}`;
    },
    fetchRentals() {
      console.debug("AdminRentalManagement: fetchRentals initiated.");
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false;

      api.get(`/api/v1/admin/rentals`)
          .then((response) => {
            console.debug("AdminRentalManagement: fetchRentals API response received:", response);
            if (response.data && response.data.status === "success") {
              const rawData = response.data.data;
              this.allRentals = Array.isArray(rawData) ? rawData.map(rental => ({
                ...rental,
                editing: false,
                editable: null
              })) : [];
              console.info(`AdminRentalManagement: Successfully fetched ${this.allRentals.length} rentals.`);
            } else if (response.status === 204 || (response.data && response.data.data && response.data.data.length === 0)) {
              console.info("AdminRentalManagement: No rentals found or list is empty.");
              this.allRentals = [];
            } else {
              console.warn("AdminRentalManagement: fetchRentals API response indicates failure or unexpected format.", response.data);
              this.handleApiResponseError(response.data, "Failed to fetch rentals: Invalid API response structure.");
              this.allRentals = [];
            }
          })
          .catch((error) => {
            console.error("AdminRentalManagement: Error during fetchRentals API call.", error.response || error);
            this.handleApiCatchError(error, "An error occurred while fetching rental data.");
            this.allRentals = [];
          })
          .finally(() => {
            this.applyFiltersAndSort();
            this.loading = false;
            console.debug("AdminRentalManagement: fetchRentals finished.");
          });
    },
    getPropertyValue(object, key) {
      if (object == null || typeof key !== 'string') return '';
      const keys = key.split('.');
      let value = object;
      try {
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else { return ''; }
        }
      } catch (e) {
        console.warn(`AdminRentalManagement: Error accessing property '${key}' in getPropertyValue.`, e);
        return '';
      }
      return value === null || typeof value === 'undefined' ? '' : value;
    },
    applyFiltersAndSort() {
      console.debug("AdminRentalManagement: Applying filters and sort. Query:", this.searchQuery, "SortBy:", this.currentSortColumn, this.currentSortDirection);
      let processedList = [...this.allRentals];
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const lowerQuery = this.searchQuery.toLowerCase().trim();
        processedList = processedList.filter(r =>
                (r.uuid?.toLowerCase().includes(lowerQuery)) ||
                (r.status?.toLowerCase().includes(lowerQuery)) ||
                (this.formatDisplayDateTime(r.issuedDate)?.toLowerCase().includes(lowerQuery)) ||
                (this.formatDisplayDateTime(r.expectedReturnDate)?.toLowerCase().includes(lowerQuery)) ||
                (this.formatDisplayDateTime(r.returnedDate)?.toLowerCase().includes(lowerQuery)) ||
                (String(r.fine).toLowerCase().includes(lowerQuery)) ||
                (this.getPropertyValue(r, 'user.firstName')?.toLowerCase().includes(lowerQuery)) ||
                (this.getPropertyValue(r, 'user.lastName')?.toLowerCase().includes(lowerQuery)) ||
                (this.getPropertyValue(r, 'user.email')?.toLowerCase().includes(lowerQuery)) ||
                (this.getPropertyValue(r, 'car.make')?.toLowerCase().includes(lowerQuery)) ||
                (this.getPropertyValue(r, 'car.model')?.toLowerCase().includes(lowerQuery))
        );
      }
      this.sortList(processedList);
    },
    sortList(listToSort) {
      if (this.currentSortColumn) {
        listToSort.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.currentSortColumn);
          let valB = this.getPropertyValue(b, this.currentSortColumn);
          let comparison = 0;
          valA = String(valA === null || typeof valA === "undefined" ? "" : valA);
          valB = String(valB === null || typeof valB === "undefined" ? "" : valB);
          const isDateColumn = ['issuedDate', 'expectedReturnDate', 'returnedDate'].includes(this.currentSortColumn);
          if (isDateColumn) {
            const dateA = new Date(valA).getTime();
            const dateB = new Date(valB).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
              comparison = dateA - dateB;
            } else { comparison = valA.localeCompare(valB); }
          } else if (this.isNumeric(valA) && this.isNumeric(valB) && this.currentSortColumn !== 'uuid') {
            comparison = parseFloat(valA) - parseFloat(valB);
          } else {
            comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
          }
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.rentalsToDisplay = listToSort;
    },
    isNumeric(val) { return !isNaN(parseFloat(val)) && isFinite(val); },
    sortRentalsBy(sortKey) {
      console.info(`AdminRentalManagement: Sort request for key: ${sortKey}`);
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
    initiateDeleteRental(rental) {
      this.rentalToDelete = { ...rental };
      this.showDeleteConfirmationModal = true;
    },
    executeDeleteRental() {
      if (!this.rentalToDelete || !this.rentalToDelete.uuid) {
        this.showDeleteConfirmationModal = false; return;
      }
      const rentalUuidToDelete = this.rentalToDelete.uuid;
      this.showSubmittingModal = true;
      this.showDeleteConfirmationModal = false;
      api.delete(`/api/v1/admin/rentals/${rentalUuidToDelete}`)
          .then((response) => {
            if (response.status === 204 || response.status === 200) {
              this.showSuccessModal("Rental soft-deleted successfully.");
              this.fetchRentals();
            } else {
              this.handleApiResponseError(response.data, `Delete operation responded with status: ${response.status}`);
            }
          })
          .catch((error) => this.handleApiCatchError(error, "Failed to delete rental."))
          .finally(() => {
            this.showSubmittingModal = false;
            this.rentalToDelete = null;
          });
    },
    cancelDeleteRental() {
      this.rentalToDelete = null;
      this.showDeleteConfirmationModal = false;
    },
    startEditRental(rental) {
      console.info(`AdminRentalManagement: Starting edit for rental UUID: ${rental.uuid}`);
      rental.editable = {
        userUuid: rental.user?.uuid || '',
        carUuid: rental.car?.uuid || '',
        driverUuid: rental.driver?.uuid || '',
        // The backend DTO expects 'issuer' and 'receiver' as UUIDs
        issuer: rental.issuer || '', // Assuming rental.issuer from response holds the UUID string
        receiver: rental.receiver || '', // Assuming rental.receiver from response holds the UUID string
        fine: rental.fine !== null && rental.fine !== undefined ? rental.fine : 0.0,
        issuedDate: rental.issuedDate ? this.formatInputDateTime(rental.issuedDate) : '',
        expectedReturnDate: rental.expectedReturnDate ? this.formatInputDateTime(rental.expectedReturnDate) : '',
        actualReturnedDate: rental.returnedDate ? this.formatInputDateTime(rental.returnedDate) : '', // For the form, maps to DTO 'returnedDate'
        status: rental.status || '',
      };
      rental.editing = true;
    },
    formatInputDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (e) {
        console.error("AdminRentalManagement: Error formatting input date-time:", dateTimeString, e);
        return '';
      }
    },
    confirmSaveRental(rental) {
      this.rentalToSave = rental;
      this.showSaveConfirmationModal = true;
    },
    cancelSaveRental() {
      this.rentalToSave = null;
      this.showSaveConfirmationModal = false;
    },
    executeUpdateRental() {
      if (!this.rentalToSave || !this.rentalToSave.editable) {
        this.showFailureModal("Cannot save rental: No rental data to save.");
        this.showSaveConfirmationModal = false; this.rentalToSave = null; return;
      }
      this.showSaveConfirmationModal = false;
      this.showSubmittingModal = true;

      const ed = this.rentalToSave.editable;
      const updatePayload = {
        // Ensure these keys match your RentalUpdateDTO.java
        userUuid: ed.userUuid?.trim() || null,
        carUuid: ed.carUuid?.trim() || null, // Corrected from ed.uuid
        driverUuid: ed.driverUuid?.trim() || null,
        issuer: ed.issuer?.trim() || null, // DTO expects 'issuer' (UUID string)
        receiver: ed.receiver?.trim() || null, // DTO expects 'receiver' (UUID string)
        fine: (ed.fine !== null && ed.fine !== undefined && ed.fine !== '') ? parseFloat(ed.fine) : null,
        issuedDate: ed.issuedDate || null,
        expectedReturnDate: ed.expectedReturnDate || null,
        returnedDate: ed.actualReturnedDate || null, // From form's actualReturnedDate to DTO's returnedDate
        status: ed.status || null,
      };
      console.debug("AdminRentalManagement: Update payload for rental UUID", this.rentalToSave.uuid, ":", updatePayload);

      api.put(`/api/v1/admin/rentals/${this.rentalToSave.uuid}`, updatePayload)
          .then((response) => {
            if (response.data && response.data.status === "success" && response.data.data) {
              this.showSuccessModal("Rental updated successfully.");
              this.fetchRentals(); // Re-fetch for consistency
            } else {
              this.handleApiResponseError(response.data, "Update failed: Server responded with an error.");
            }
          })
          .catch((error) => this.handleApiCatchError(error, "An error occurred while updating the rental."))
          .finally(() => {
            this.showSubmittingModal = false;
            if (this.rentalToSave) { // Ensure it still exists (not cleared by another path)
                // Find the original item in allRentals to turn off editing mode,
                // especially if fetchRentals is not called or fails.
                const originalRentalInList = this.allRentals.find(r => r.uuid === this.rentalToSave.uuid);
                if (originalRentalInList) {
                    originalRentalInList.editing = false;
                    originalRentalInList.editable = null;
                }
            }
            this.rentalToSave = null; // Clear after operation
          });
    },
    cancelEditRental(rental) {
      rental.editing = false;
      rental.editable = null;
    },
    viewRentalDetails(uuid) {
      this.$router.push({ name: 'ViewRental', params: { uuid: uuid } });
    },
    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },
    closeSuccessModal() { this.successModal.show = false; },
    closeFailModal() { this.failModal.show = false; },
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData && typeof responseData === 'string' && responseData.length < 200) {
        errorMsg = responseData;
      } else if (responseData && responseData.message) {
        errorMsg = responseData.message;
      }
      this.failModal.message = errorMsg;
      this.failModal.show = true;
      this.apiError = true;
    },
    handleApiCatchError(error, defaultMessage) {
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
      } else if (error.request && !error.response) {
        errorMessage = "No response from server. Please check your network connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
      this.apiError = true;
    },
  },
  created() {
    this.fetchRentals();
  },
};
</script>

<style scoped>


</style>