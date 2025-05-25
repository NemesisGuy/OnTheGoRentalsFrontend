<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-file-contract"></i> Rental Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button @click="resetSearch" class="read-button  button">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/rentals/create" class="add-button button">
            <i class="fas fa-contact-book"></i> Add Rental
          </router-link>
        </div>
      </div>
    </div>
    <ShimmerAdminTable v-if="loading" :rows="20" :columns="1" />

    <table v-else>
      <thead>
      <tr>
        <th @click="sortRentals('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('user.userName')">User <i class="fas fa-sort"></i></th>
<!--        <th @click="sortRentals('user.firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('user.lastName')">Last Name <i class="fas fa-sort"></i></th>-->
        <th @click="sortRentals('car')">Car<i class="fas fa-sort"></i></th>
        <th @click="sortRentals('driver')">Driver <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('issuer')">Issuer <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('dateRented')">Date Rented <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('dateReturned')">Date Returned <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('receiver')">Receiver<i class="fas fa-sort"></i></th>
        <th @click="sortRentals('status')">Status <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('finePaid')">Fine Paid <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="rental in rentalsToDisplay" :key="rental.uuid"> <!-- CHANGED to rentalsToDisplay -->
        <!-- Also changed key to rental.uuid for consistency -->
        <!-- UUID -->
        <td>{{ rental.uuid ? rental.uuid.substring(0, 8) + '...' : 'N/A' }}</td>

        <!-- User -->
        <td v-if="!rental.editing">{{ rental.user ? `${rental.user.firstName} ${rental.user.lastName}` : 'N/A' }}</td>
        <td v-else>
          <input v-model="rental.editable.userUuidString"
                 class="form-control-inline"
                 placeholder="User UUID (if changing)"
                 type="text">
        </td>

        <!-- Car -->
        <td v-if="!rental.editing">{{ rental.car ? `${rental.car.make} ${rental.car.model}` : 'N/A' }}</td>
        <td v-else>
          <input v-model="rental.editable.carUuidString"
                 class="form-control-inline"
                 placeholder="Car UUID (if changing)"
                 type="text">
        </td>

        <!-- Driver -->
        <td v-if="!rental.editing">{{ rental.driver ? `${rental.driver.firstName} ${rental.driver.lastName}` : 'N/A' }}</td>
        <td v-else>
          <input v-model="rental.editable.driverUuidString"
                 class="form-control-inline"
                 placeholder="Driver UUID (or blank)"
                 type="text">
        </td>
        <!-- Issuer -->
        <td v-if="!rental.editing">{{ rental.issuer ? `${rental.issuer} ` : 'N/A' }}</td>

        <!-- Issued Date -->
        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.issuedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.issuedDate" class="form-control-inline"></td>

<!--        &lt;!&ndash; Expected Returned Date &ndash;&gt;
        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.expectedReturnedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.expectedReturnedDate" class="form-control-inline"></td>-->

        <!-- Actual Returned Date -->
        <td v-if="!rental.editing">{{ formatDisplayDateTime(rental.returnedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="rental.editable.returnedDate" class="form-control-inline"></td>
    <!--Receiver-->
        <td v-if="!rental.editing">{{ rental.receiver ? `${rental.receiver}` : 'N/A' }}</td>
        <!-- Status -->
        <td v-if="!rental.editing"><span :class="['status-badge', getStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></td>
        <td v-else>
          <select v-model="rental.editable.status" class="form-control-inline-select">
            <option v-for="statusOption in rentalStatusOptions" :key="statusOption" :value="statusOption">
              {{ formatStatus(statusOption) }}
            </option>
          </select>
        </td>

        <!-- Fine -->
        <td v-if="!rental.editing">{{ rental.fine != null ? '$' + rental.fine.toFixed(2) : 'N/A' }}</td>
        <td v-else><input type="number" step="0.01" v-model.number="rental.editable.fine" class="form-control-inline"></td>

        <td class="actions-cell">
          <template v-if="!rental.editing">
            <button @click="viewRental(rental.uuid)" class="button read-button" title="View Details"><i class="fas fa-eye"></i> View</button>
            <button @click="startEditRental(rental)" class="button update-button" title="Edit Rental"><i class="fas fa-edit"></i> Edit</button>
            <button @click="initiateDeleteRental(rental)" class="button delete-button" title="Delete Rental"><i class="fas fa-trash"></i> Delete</button>
          </template>
          <template v-else>
            <button @click="confirmSaveRental(rental)" class="button save-button" title="Save Changes"><i class="fas fa-save"></i></button>
            <button @click="cancelEditRental(rental)" class="button cancel-button" title="Cancel Edit"><i class="fas fa-times"></i></button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @confirm="confirmDeleteRental"
        @cancel="cancelDeleteRental"
    >
      <template v-if="rentalToDelete">
        <div>
          <p>Are you sure you want to delete this rental?</p>
          <hr>
          <h3>Rental Details:</h3>
          <p> {{ rentalToDelete }} <!--{{ rentalToDelete.user.lastName }}--></p>
          <!--          <p>Car: {{ rentalToDelete.car.model }}</p>-->
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" @close="closeModal" @cancel="closeModal" :show="successModal.show"
                  :message="successModal.message"></SuccessModal>
    <FailureModal v-if="failModal.show" @close="closeModal" @cancel="closeModal" :show="failModal.show"
                  :message="failModal.message"></FailureModal>
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

const RENTAL_STATUS_OPTIONS = ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'];

export default {
  name: "RentalManagement", // Or AdminRentalManagement
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
      loading: true, // Start with loading true for initial fetch
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
    async getRentals() {
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false;
      console.log("RentalManagement: Fetching rentals...");
      try {
        const response = await api.get(`/api/v1/admin/rentals`);
        console.log("RentalManagement - API Response:", response);

        if (response.data && response.data.status === "success") {
          // Ensure response.data.data is an array, default to empty array if null/undefined
          const rawData = response.data.data;
          console.log("RentalManagement - Raw data from response.data.data:", rawData);

          this.allRentals = Array.isArray(rawData) ? rawData.map(rental => ({
            ...rental,
            editing: false,
            editable: null
          })) : [];

          console.log("RentalManagement - Mapped allRentals (count):", this.allRentals.length);
          this.applyFiltersAndSort();
        } else {
          console.error("RentalManagement - API response not success or data missing", response.data);
          this.handleApiResponseError(response.data, "Failed to fetch rentals list.");
          this.allRentals = []; // Clear on error
          this.applyFiltersAndSort(); // Apply to show empty state correctly
        }
      } catch (error) {
        console.error("RentalManagement - API call failed (catch block)", error);
        this.handleApiCatchError(error, "Failed to fetch rentals. Please try again.");
        this.allRentals = []; // Clear on error
        this.applyFiltersAndSort(); // Apply to show empty state correctly
      } finally {
        this.loading = false;
        console.log("RentalManagement: Finished fetching rentals. Loading:", this.loading);
      }
    },
    getPropertyValue(object, key) {
      if (object == null || typeof key !== 'string') return '';
      const keys = key.split('.');
      let value = object;
      try {
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return '';
          }
        }
      } catch (e) { return ''; }
      return value === null || typeof value === 'undefined' ? '' : value; // Ensure consistent empty string for null/undefined
    },
    applyFiltersAndSort() {
      console.log("RentalManagement - applyFiltersAndSort - Start. AllRentals count:", this.allRentals.length, "Query:", this.searchQuery);
      let processedList = [...this.allRentals];

      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        processedList = processedList.filter(rental => {
          return (rental.uuid?.toLowerCase().includes(lowerQuery)) ||
              (rental.status?.toLowerCase().includes(lowerQuery)) ||
              (this.formatDisplayDateTime(rental.issuedDate)?.toLowerCase().includes(lowerQuery)) ||
              (this.formatDisplayDateTime(rental.expectedReturnedDate)?.toLowerCase().includes(lowerQuery)) ||
              (this.formatDisplayDateTime(rental.returnedDate)?.toLowerCase().includes(lowerQuery)) ||
              (String(rental.fine).toLowerCase().includes(lowerQuery)) ||
              (rental.user?.firstName?.toLowerCase().includes(lowerQuery)) ||
              (rental.user?.lastName?.toLowerCase().includes(lowerQuery)) ||
              (rental.user?.email?.toLowerCase().includes(lowerQuery)) ||
              (rental.car?.make?.toLowerCase().includes(lowerQuery)) ||
              (rental.car?.model?.toLowerCase().includes(lowerQuery)) ||
              (rental.car?.licensePlate?.toLowerCase().includes(lowerQuery));
        });
      }
      console.log("RentalManagement - applyFiltersAndSort - After filter, count:", processedList.length);
      this.sortList(processedList);
    },
    sortList(listToSort) {
      console.log("RentalManagement - sortList - Start, count:", listToSort.length, "SortBy:", this.currentSortColumn, "Dir:", this.currentSortDirection);
      if (this.currentSortColumn) {
        listToSort.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.currentSortColumn);
          let valB = this.getPropertyValue(b, this.currentSortColumn);

          let comparison = 0;
          if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB);
          } else if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
          } else {
            comparison = String(valA).localeCompare(String(valB));
          }
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.rentalsToDisplay = listToSort;
      console.log("RentalManagement - sortList - End, rentalsToDisplay count:", this.rentalsToDisplay.length);
    },
    sortRentals(sortKey) {
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
      this.rentalToDelete = { ...rental }; // Store a copy
      this.showDeleteConfirmationModal = true;
    },
    async executeDeleteRental() {
      if (this.rentalToDelete && this.rentalToDelete.uuid) {
        this.loading = true; // Consider a specific loading flag for delete action
        this.showDeleteConfirmationModal = false;
        try {
          await api.delete(`/api/v1/admin/rentals/${this.rentalToDelete.uuid}`);
          this.showSuccessModal("Rental soft-deleted successfully.");
          await this.getRentals();
        } catch (error) {
          this.handleApiCatchError(error, "Failed to delete rental.");
        } finally {
          this.loading = false;
          this.rentalToDelete = null;
        }
      } else {
        this.showDeleteConfirmationModal = false;
        this.rentalToDelete = null;
      }
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
        issuerId: rental.issuer, // Assuming rental.issuer is the ID
        receiverId: rental.receiver,
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
    async executeSaveRental() {
      if (!this.rentalToSave || !this.rentalToSave.editable) {
        this.showSaveConfirmationModal = false;
        return;
      }
      this.showSaveConfirmationModal = false;
      this.loading = true;

      const editableData = this.rentalToSave.editable;
      const updatePayload = {
        userUuid: editableData.userUuidString && editableData.userUuidString.trim() !== "" ? editableData.userUuidString.trim() : null,
        carUuid: editableData.carUuidString && editableData.carUuidString.trim() !== "" ? editableData.carUuidString.trim() : null,
        driverUuid: editableData.driverUuidString && editableData.driverUuidString.trim() !== "" ? editableData.driverUuidString.trim() : null,
        issuedDate: editableData.issuedDate,
        expectedReturnedDate: editableData.expectedReturnedDate,
        actualReturnedDate: editableData.returnedDate || null,
        status: editableData.status,
        issuerId: editableData.issuerId, // ensure editable has issuerId
        receiverId: editableData.receiverId, // ensure editable has receiverId
        fine: editableData.fine,
      };
      if (updatePayload.userUuid === "") updatePayload.userUuid = null;
      if (updatePayload.carUuid === "") updatePayload.carUuid = null;
      if (updatePayload.driverUuid === "") updatePayload.driverUuid = null;

      console.log("Payload for rental update:", updatePayload);
      try {
        await api.put(`/api/v1/admin/rentals/${this.rentalToSave.uuid}`, updatePayload);
        this.showSuccessModal("Rental updated successfully.");
        this.rentalToSave.editing = false;
        this.rentalToSave.editable = null;
        await this.getRentals();
      } catch (error) {
        this.handleApiCatchError(error, "Failed to update rental.");
      } finally {
        this.loading = false;
        this.rentalToSave = null;
      }
    },
    cancelEditRental(rental) {
      rental.editing = false;
      rental.editable = null;
    },
    viewRental(uuid) {
      console.log("Viewing rental with UUID:", uuid);
      this.$router.push({ name: 'ViewRental', params: { uuid: uuid } });
    },
    showSuccessModal(message) {
      this.successModal.message = message;
      this.successModal.show = true;
    },
    closeSuccessModal() {
      this.successModal.show = false;
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => e.message || e.field).join(', ');
      } else if (responseData && typeof responseData === 'string' && responseData.length < 200) { // Check if it's a simple string error from backend
        errorMsg = responseData;
      } else if (responseData && responseData.message) {
        errorMsg = responseData.message;
      }
      console.error("API Response Error (Rental Management):", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
      this.apiError = true;
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (Rental Management):", error); // Log the whole error object
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data; // This should be your ApiResponse for errors
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) { // General message from ApiResponse (if not FieldErrorDto)
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check network connection.";
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
      this.apiError = true;
    },
  },
  created() {
    this.getRentals();
  },
};
</script>

<!-- Your <style> block remains unchanged -->
<style>

</style>