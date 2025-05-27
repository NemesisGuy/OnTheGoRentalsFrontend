<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-file-alt"></i> Rental Management <!-- Changed icon to be more generic for rental -->
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" @input="applyFiltersAndSort" placeholder="Search by User, Car, Status..." type="text"/>
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-times"></i> Reset
            </button>
          </div>
          <!-- Assuming 'AdminCreateRental' is the correct route name for creating a new *rental* directly by admin -->
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
        <th @click="sortRentalsBy('issuerId')">Issuer ID <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('issuedDate')">Issued Date <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('expectedReturnedDate')">Expected Return <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('returnedDate')">Actual Return <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('receiverId')">Receiver ID <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('status')">Status <i class="fas fa-sort"></i></th>
        <th @click="sortRentalsBy('fine')">Fine <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="rental in rentalsToDisplay" :key="rental.uuid">
        <td>{{ rental.uuid ? rental.uuid.substring(0, 8) + '...' : 'N/A' }}</td>
        <td v-if="!rental.editing">{{ rental.user ? `${rental.user.firstName} ${rental.user.lastName}` : 'N/A' }}</td>
        <td v-else><input v-model="rental.editable.userUuidString" class="form-control-inline" placeholder="User UUID" type="text"></td>
        <td v-if="!rental.editing">{{ rental.car ? `${rental.car.make} ${rental.car.model}` : 'N/A' }}</td>
        <td v-else><input v-model="rental.editable.carUuidString" class="form-control-inline" placeholder="Car UUID" type="text"></td>
        <td v-if="!rental.editing">{{ rental.driver ? `${rental.driver.firstName} ${rental.driver.lastName}` : 'N/A' }}</td>
        <td v-else><input v-model="rental.editable.driverUuidString" class="form-control-inline" placeholder="Driver UUID" type="text"></td>
        <td v-if="!rental.editing">{{ rental.issuerId != null ? rental.issuerId : 'N/A' }}</td>
        <td v-else><input type="number" v-model.number="rental.editable.issuerId" class="form-control-inline"></td>
        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.issuedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.issuedDate" class="form-control-inline"></td>
        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.expectedReturnedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.expectedReturnedDate" class="form-control-inline"></td>
        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.returnedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.actualReturnedDate" class="form-control-inline"></td>
        <td v-if="!rental.editing">{{ rental.receiverId != null ? rental.receiverId : 'N/A' }}</td>
        <td v-else><input type="number" v-model.number="rental.editable.receiverId" class="form-control-inline"></td>
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
        @confirm="executeSaveRental"
        @cancel="cancelSaveRental"
    >
      <template #default v-if="rentalToSave && rentalToSave.editable">
        <p>Save changes for rental UUID {{rentalToSave.uuid ? rentalToSave.uuid.substring(0,8) : 'N/A'}}...?</p>
        <hr>
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

// These statuses should align with your backend RentalStatus enum
const RENTAL_STATUS_OPTIONS = ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE', 'BOOKED'];

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
      allRentals: [],        // Stores RentalResponseDTOs
      rentalsToDisplay: [],  // Array for v-for
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
      currentSortColumn: 'issuedDate', // Match a field in RentalResponseDTO
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
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false;

      api.get(`/api/v1/admin/rentals`) // Endpoint from AdminRentalController
          .then((response) => {
            if (response.data && response.data.status === "success") {
              const rawData = response.data.data;
              this.allRentals = Array.isArray(rawData) ? rawData.map(rental => ({
                ...rental, // Spread RentalResponseDTO
                editing: false,
                editable: null
              })) : [];
            } else {
              this.handleApiResponseError(response.data, "Failed to fetch rentals.");
              this.allRentals = [];
            }
          })
          .catch((error) => {
            this.handleApiCatchError(error, "Failed to fetch rentals.");
            this.allRentals = [];
          })
          .finally(() => {
            this.applyFiltersAndSort(); // Ensure display list is updated even on error/empty
            this.loading = false;
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
      } catch (e) { return ''; }
      return value === null || typeof value === 'undefined' ? '' : value;
    },

    applyFiltersAndSort() {
      let processedList = [...this.allRentals];
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const lowerQuery = this.searchQuery.toLowerCase().trim();
        processedList = processedList.filter(r => // r for rental
            (r.uuid?.toLowerCase().includes(lowerQuery)) ||
            (r.status?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(r.issuedDate)?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(r.expectedReturnedDate)?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(r.returnedDate)?.toLowerCase().includes(lowerQuery)) ||
            (String(r.fine).toLowerCase().includes(lowerQuery)) ||
            (r.user?.firstName?.toLowerCase().includes(lowerQuery)) ||
            (r.user?.lastName?.toLowerCase().includes(lowerQuery)) ||
            (r.user?.email?.toLowerCase().includes(lowerQuery)) ||
            (r.car?.make?.toLowerCase().includes(lowerQuery)) ||
            (r.car?.model?.toLowerCase().includes(lowerQuery))
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
          const isDateColumn = ['issuedDate', 'expectedReturnedDate', 'returnedDate'].includes(this.currentSortColumn);

          if (isDateColumn) {
            const dateA = new Date(valA).getTime();
            const dateB = new Date(valB).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
              comparison = dateA - dateB;
            } else { comparison = valA.localeCompare(valB); }
          } else if (this.isNumeric(valA) && this.isNumeric(valB) && this.currentSortColumn !== 'uuid') {
            comparison = parseFloat(valA) - parseFloat(valB);
          } else {
            comparison = valA.localeCompare(valB);
          }
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.rentalsToDisplay = listToSort;
    },
    isNumeric(val) { return !isNaN(parseFloat(val)) && isFinite(val); },
    sortRentalsBy(sortKey) {
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
      if (this.rentalToDelete && this.rentalToDelete.uuid) {
        this.showSubmittingModal = true;
        this.showDeleteConfirmationModal = false;
        api.delete(`/api/v1/admin/rentals/${this.rentalToDelete.uuid}`)
            .then(() => {
              this.showSuccessModal("Rental soft-deleted successfully.");
              this.fetchRentals();
            })
            .catch((error) => this.handleApiCatchError(error, "Failed to delete rental."))
            .finally(() => {
              this.showSubmittingModal = false;
              this.rentalToDelete = null;
            });
      } else { this.showDeleteConfirmationModal = false; this.rentalToDelete = null; }
    },
    cancelDeleteRental() {
      this.rentalToDelete = null;
      this.showDeleteConfirmationModal = false;
    },
    startEditRental(rental) {
      rental.editable = {
        userUuidString: rental.user?.uuid || '',
        carUuidString: rental.car?.uuid || '',
        driverUuidString: rental.driver?.uuid || '',
        issuedDate: rental.issuedDate ? this.formatInputDateTime(rental.issuedDate) : '',
        expectedReturnedDate: rental.expectedReturnedDate ? this.formatInputDateTime(rental.expectedReturnedDate) : '',
        returnedDate: rental.returnedDate ? this.formatInputDateTime(rental.returnedDate) : '',
        status: rental.status,
        fine: rental.fine !== null ? rental.fine : 0.0,
        issuerId: rental.issuerId,
        receiverId: rental.receiverId,
      };
      rental.editing = true;
    },
    formatInputDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().substring(0, 16);
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
        this.showSaveConfirmationModal = false; return;
      }
      this.showSaveConfirmationModal = false;
      this.showSubmittingModal = true;

      const ed = this.rentalToSave.editable;
      // Payload MUST match backend's AdminRentalUpdateDTO (or generic BookingUpdateDTO)
      const updatePayload = {
        userUuid: ed.userUuidString?.trim() || undefined, // Send undefined if empty/null
        carUuid: ed.carUuidString?.trim() || undefined,
        driverUuid: ed.driverUuidString?.trim() || undefined,
        issuedDate: ed.issuedDate,                     // Should be bookingStartDate in DTO
        expectedReturnedDate: ed.expectedReturnedDate, // Should be bookingEndDate in DTO
        actualReturnedDate: ed.returnedDate || null,
        status: ed.status,
        issuerId: ed.issuerId,
        receiverId: ed.receiverId,
        fine: ed.fine,
      };
      // Clean up undefined fields so they are not sent as null if not intended
      Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

      api.put(`/api/v1/admin/rentals/${this.rentalToSave.uuid}`, updatePayload)
          .then((response) => {
            if (response.data && response.data.status === "success") {
              this.showSuccessModal("Rental updated successfully.");
              // const updatedRentalFromServer = response.data.data;
              // const index = this.allRentals.findIndex(r => r.uuid === updatedRentalFromServer.uuid);
              // if (index !== -1) {
              //     this.allRentals.splice(index, 1, { ...updatedRentalFromServer, editing: false, editable: null });
              // } else { this.fetchRentals(); } // Fallback if not found
              // this.applyFiltersAndSort();
              this.fetchRentals(); // Simpler to just re-fetch for now
              this.rentalToSave.editing = false; // Turn off editing mode on the specific item
              this.rentalToSave.editable = null;
            } else {
              this.handleApiResponseError(response.data, "Update failed: Server error.");
            }
          })
          .catch((error) => this.handleApiCatchError(error, "Failed to update rental."))
          .finally(() => {
            this.showSubmittingModal = false;
            this.rentalToSave = null;
          });
    },
    cancelEditRental(rental) {
      rental.editing = false;
      rental.editable = null;
    },
    viewRentalDetails(uuid) {
      this.$router.push({ name: 'ViewRental', params: { uuid: uuid } });
    },
    showSuccessModal(message) { this.successModal = { show: true, message }; },
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
    this.fetchRentals();
  },
};
</script>

<style scoped>/*
!* Your existing styles for .content-container, .content-header, table, th, td, .button, modal styles *!
!* Styles from your original AdminBookingManagement.vue, adapted for Rental context *!
.content-container {
  color: black;
  max-width: 98%;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0,0,0,0.05);
  border-radius: 8px;
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.content-header h1 { margin: 0; font-size: 1.8rem; color: #333; }
.content-header h1 i { margin-right: 10px; color: #007bff; } !* Blue for rental icon *!
.search-bar-container { display: flex; align-items: center; gap: 10px; flex-grow: 1; justify-content: flex-end; }
.search-bar { display: flex; gap: 10px; }
.search-input { display: flex; align-items: center; gap: 5px; }
.search-input input[type="text"] { padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem; min-width: 200px; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.85rem; table-layout: fixed; }
th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; vertical-align: middle; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
th { background-color: #f8f9fa; font-weight: 600; color: #444; cursor: pointer; user-select: none; }
th i.fa-sort { margin-left: 5px; color: #aaa; }
th:hover { background-color: #f1f3f5; }
tbody tr:nth-child(even) { background-color: #fdfdfd; }
tbody tr:hover { background-color: #f5f5f5; }

.actions-column { width: 150px; !* Adjusted width for 3 icon buttons *! text-align: center; }
.actions-cell { display: flex; gap: 5px; justify-content: center; align-items: center; }

.button { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: background-color 0.2s ease, transform 0.1s ease; display: inline-flex; align-items: center; justify-content: center; min-width: 30px; }
.button i { margin-right: 4px; }
.button:hover { transform: translateY(-1px); }

.add-button { background-color: #28a745; color: white; }
.read-button { background-color: #007bff; color: white; }
.view-button { background-color: #6f42c1; color: white; padding: 6px 8px; }
.edit-button { background-color: #fd7e14; color: white; padding: 6px 8px; }
.delete-button { background-color: #dc3545; color: white; padding: 6px 8px; }
.save-button { background-color: #17a2b8; color: white; } !* Using info color for save *!
.cancel-button { background-color: #6c757d; color: white; }

.form-control-inline { width: 100%; padding: 4px; font-size: 0.85rem; border: 1px solid #ced4da; border-radius: .2rem; box-sizing: border-box; }
.form-control-inline-select { width: 100%; padding: 4px; font-size: 0.85rem; border: 1px solid #ced4da; border-radius: .2rem; box-sizing: border-box; }

.no-data-message { text-align: center; padding: 30px; font-size: 1.1rem; color: #666; font-style: italic; }
.error-text { color: #dc3545; font-weight: bold; font-style: normal; }
.modal-body-container { position: relative; z-index: 1070; }

!* Status Badge Styles *!
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75em; font-weight: bold; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;}
.status-pending-confirmation { background-color: #ffc107; color: #333; }
.status-confirmed { background-color: #28a745; }
.status-booked { background-color: #0dcaf0; color: #000 } !* Added BOOKED based on RentalRequestDTO *!
.status-in-progress { background-color: #17a2b8; }
.status-completed { background-color: #6c757d; }
.status-cancelled { background-color: #dc3545; }
.status-overdue { background-color: #fd7e14; color: #fff;}
.status-unknown { background-color: #adb5bd; }*/
</style>