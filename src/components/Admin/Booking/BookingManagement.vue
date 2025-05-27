<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-calendar-check"></i> Booking Management</h1> <!-- Changed from Rental -->
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" @input="applyFiltersAndSort" placeholder="Search..." type="text"/> <!-- Changed to applyFiltersAndSort -->
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-times"></i> Reset
            </button>
          </div>
          <router-link :to="{ name: 'CreateBooking' }" class="add-button button"> <!-- Ensure this route name exists -->
            <i class="fas fa-plus-circle"></i> Add Booking
          </router-link>
        </div>
      </div>
    </div>

    <ShimmerAdminTable v-if="loading && allBookings.length === 0" :rows="10" :columns="10" />

    <div v-if="!loading && bookingsToDisplay.length === 0 && !apiError" class="no-data-message">
      No bookings found matching your criteria.
    </div>
    <div v-if="apiError && !loading" class="no-data-message error-text">
      {{ failModal.message || "Failed to load bookings." }}
    </div>

    <table v-if="!loading && bookingsToDisplay.length > 0">
      <thead>
      <tr>
        <th @click="sortBookings('uuid')">Booking UUID <i class="fas fa-sort"></i></th>
        <th @click="sortBookings('user.lastName')">User <i class="fas fa-sort"></i></th>
        <th @click="sortBookings('car.make')">Car <i class="fas fa-sort"></i></th>
        <th @click="sortBookings('driver.lastName')">Driver <i class="fas fa-sort"></i></th>
        <th @click="sortBookings('bookingStartDate')">Start Date <i class="fas fa-sort"></i></th> <!-- Was issuedDate -->
        <th @click="sortBookings('bookingEndDate')">End Date <i class="fas fa-sort"></i></th> <!-- Was expectedReturnedDate -->
        <th @click="sortBookings('returnedDate')">Actual Return <i class="fas fa-sort"></i></th>
        <th @click="sortBookings('status')">Status <i class="fas fa-sort"></i></th>
        <th @click="sortBookings('fine')">Fine <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <!-- Iterate over bookingsToDisplay -->
      <tr v-for="booking in bookingsToDisplay" :key="booking.uuid">
        <td>{{ booking.uuid ? booking.uuid.substring(0, 8) + '...' : 'N/A' }}</td>

        <!-- User -->
        <td v-if="!booking.editing">{{ booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A' }}</td>
        <td v-else>
          <input v-model="booking.editable.userUuidString" class="form-control-inline" placeholder="User UUID (if changing)" type="text">
        </td>

        <!-- Car -->
        <td v-if="!booking.editing">{{ booking.car ? `${booking.car.make} ${booking.car.model}` : 'N/A' }}</td>
        <td v-else>
          <input v-model="booking.editable.carUuidString" class="form-control-inline" placeholder="Car UUID (if changing)" type="text">
        </td>

        <!-- Driver -->
        <td v-if="!booking.editing">{{ booking.driver ? `${booking.driver.firstName} ${booking.driver.lastName}` : 'N/A' }}</td>
        <td v-else>
          <input v-model="booking.editable.driverUuidString" class="form-control-inline" placeholder="Driver UUID (or blank)" type="text">
        </td>

        <!-- Booking Start Date -->
        <td v-if="!booking.editing">{{ formatDisplayDateTime(booking.bookingStartDate) }}</td>
        <td v-else><input type="datetime-local" v-model="booking.editable.bookingStartDate" class="form-control-inline"></td>

        <!-- Booking End Date (Expected Return) -->
        <td v-if="!booking.editing">{{ formatDisplayDateTime(booking.bookingEndDate) }}</td>
        <td v-else><input type="datetime-local" v-model="booking.editable.bookingEndDate" class="form-control-inline"></td>

        <!-- Actual Returned Date -->
        <td v-if="!booking.editing">{{ formatDisplayDateTime(booking.returnedDate) }}</td>
        <td v-else><input type="datetime-local" v-model="booking.editable.actualReturnedDate" class="form-control-inline"></td>

        <!-- Status -->
        <td v-if="!booking.editing"><span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span></td>
        <td v-else>
          <select v-model="booking.editable.status" class="form-control-inline-select">
            <option v-for="statusOption in rentalStatusOptions" :key="statusOption" :value="statusOption">
              {{ formatStatus(statusOption) }}
            </option>
          </select>
        </td>

        <!-- Fine -->
        <td v-if="!booking.editing">{{ booking.fine != null ? '$' + booking.fine.toFixed(2) : 'N/A' }}</td>
        <td v-else><input type="number" step="0.01" v-model.number="booking.editable.fine" class="form-control-inline"></td>

        <td class="actions-cell">
          <template v-if="!booking.editing">
            <button @click="viewBookingDetails(booking.uuid)" class="read-button button" title="View Details"><i class="fas fa-eye"></i>View</button>
            <button @click="startEditBooking(booking)" class="button edit-button" title="Edit Booking"><i class="fas fa-edit"></i>Edit</button>
            <button @click="initiateDeleteBooking(booking)" class="button delete-button" title="Delete Booking"><i class="fas fa-trash"></i>Delete</button>
          </template>
          <template v-else>
            <button @click="confirmSaveBooking(booking)" class="button save-button" title="Save Changes"><i class="fas fa-save"></i>Save</button>
            <button @click="cancelEditBooking(booking)" class="button cancel-button" title="Cancel Edit"><i class="fas fa-times"></i>Cancel</button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <div class="modal-body-container">
    <ConfirmationModal
        key="bookingDeleteConfirmModal"
        :show="showDeleteConfirmationModal"
    title="Confirm Booking Deletion"
    @cancel="cancelDeleteBooking"
    @confirm="executeDeleteBooking"
    >
    <template #default v-if="bookingToDelete">
      <p>Are you sure you want to soft-delete this booking?</p>
      <hr>
      <p><strong>Booking UUID:</strong> {{ bookingToDelete.uuid ? bookingToDelete.uuid.substring(0,8) : 'N/A' }}...</p>
      <p><strong>User:</strong> {{ bookingToDelete.user ? `${bookingToDelete.user.firstName} ${bookingToDelete.user.lastName}` : 'N/A' }}</p>
      <p><strong>Car:</strong> {{ bookingToDelete.car ? `${bookingToDelete.car.make} ${bookingToDelete.car.model}` : 'N/A' }}</p>
    </template>
    </ConfirmationModal>

    <ConfirmationModal
        key="bookingSaveConfirmModal"
        :show="showSaveConfirmationModal"
    title="Confirm Booking Update"
    @cancel="cancelSaveBooking"
    @confirm="executeUpdateBooking"
    >
    <template #default v-if="bookingToSave && bookingToSave.editable">
      <p>Are you sure you want to save these changes for booking UUID {{bookingToSave.uuid ? bookingToSave.uuid.substring(0,8) : 'N/A'}}...?</p>
      <!-- Display changed fields for confirmation if desired -->
      <p><strong>Status:</strong> {{ formatStatus(bookingToSave.editable.status) }}</p>
    </template>
    </ConfirmationModal>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeSuccessModal"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFailModal"/>
  </div>
</template>

<script>
// ... (script remains largely the same as the full one I provided in the previous "RentalManagement" response,
//      just ensure method names like `confirmAndDeleteBooking` are changed to `executeDeleteBooking`
//      and `updateBooking` is `executeUpdateBooking` if those were the final names.
//      And ensure the data properties `showDeleteConfirmationModal` and `showSaveConfirmationModal` exist and are used.
//      The `filteredBookings` computed property should be removed if applyFiltersAndSort directly updates `bookingsToDisplay`.)

import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ShimmerAdminTable from "@/components/Main/Loaders/ShimmerAdminTable.vue";
import api from "@/api.js";
import { formatDateTime } from '@/utils/dateUtils.js';

const RENTAL_STATUS_OPTIONS = ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE']; // Make sure this matches your backend RentalStatus enum string values

export default {
  name: "AdminBookingManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
    ShimmerAdminTable,
  },
  data() {
    return {
      allBookings: [],
      bookingsToDisplay: [], // Use this for v-for in template
      searchQuery: "",
      loading: true,
      apiError: false,
      showDeleteConfirmationModal: false, // This MUST be defined
      showSaveConfirmationModal: false,   // This MUST be defined
      bookingToDelete: null,
      bookingToSave: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'bookingStartDate', // Changed to match DTO
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
    async fetchBookings() {
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false;
      try {
        const response = await api.get(`/api/v1/admin/bookings`);
        if (response.data && response.data.status === "success") {
          const rawData = response.data.data;
          this.allBookings = Array.isArray(rawData) ? rawData.map(booking => ({
            ...booking,
            editing: false,
            editable: null
          })) : [];
          this.applyFiltersAndSort();
        } else {
          this.handleApiResponseError(response.data, "Failed to fetch bookings.");
        }
      } catch (error) {
        this.handleApiCatchError(error, "Failed to fetch bookings.");
      } finally {
        this.loading = false;
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
          } else { return ''; }
        }
      } catch (e) { return ''; }
      return value === null || typeof value === 'undefined' ? '' : value;
    },
    applyFiltersAndSort() {
      let processedList = [...this.allBookings];
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        processedList = processedList.filter(b =>
            (b.uuid?.toLowerCase().includes(lowerQuery)) ||
            (b.status?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(b.bookingStartDate)?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(b.bookingEndDate)?.toLowerCase().includes(lowerQuery)) ||
            (b.user?.firstName?.toLowerCase().includes(lowerQuery)) ||
            (b.user?.lastName?.toLowerCase().includes(lowerQuery)) ||
            (b.car?.make?.toLowerCase().includes(lowerQuery)) ||
            (b.car?.model?.toLowerCase().includes(lowerQuery))
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
      this.bookingsToDisplay = listToSort; // Update the correct display array
    },
    sortBookings(sortKey) {
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
    initiateDeleteBooking(booking) {
      this.bookingToDelete = { ...booking };
      this.showDeleteConfirmationModal = true;
    },
    async executeDeleteBooking() { // This method is called on modal confirm
      if (this.bookingToDelete && this.bookingToDelete.uuid) {
        this.loading = true;
        this.showDeleteConfirmationModal = false;
        try {
          await api.delete(`/api/v1/admin/bookings/${this.bookingToDelete.uuid}`);
          this.showSuccessModal("Booking soft-deleted successfully.");
          await this.fetchBookings();
        } catch (error) {
          this.handleApiCatchError(error, "Failed to delete booking.");
        } finally {
          this.loading = false;
          this.bookingToDelete = null;
        }
      } else {
        this.showDeleteConfirmationModal = false;
        this.bookingToDelete = null;
      }
    },
    cancelDeleteBooking() {
      this.bookingToDelete = null;
      this.showDeleteConfirmationModal = false;
    },
    startEditBooking(booking) {
      booking.editable = {
        userUuidString: booking.user?.uuid || '',
        carUuidString: booking.car?.uuid || '',
        driverUuidString: booking.driver?.uuid || '',
        bookingStartDate: booking.bookingStartDate ? this.formatInputDateTime(booking.bookingStartDate) : '',
        bookingEndDate: booking.bookingEndDate ? this.formatInputDateTime(booking.bookingEndDate) : '',
        actualReturnedDate: booking.returnedDate ? this.formatInputDateTime(booking.returnedDate) : '',
        status: booking.status,
        issuerId: booking.issuer,
        receiverId: booking.receiver,
        fine: booking.fine !== null ? booking.fine : 0.0,
      };
      booking.editing = true;
    },
    formatInputDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().substring(0, 16);
    },
    confirmSaveBooking(booking) {
      this.bookingToSave = booking;
      this.showSaveConfirmationModal = true;
    },
    cancelSaveBooking() {
      this.bookingToSave = null;
      this.showSaveConfirmationModal = false;
    },
    async executeUpdateBooking() { // This method is called on modal confirm
      if (!this.bookingToSave || !this.bookingToSave.editable) {
        this.showSaveConfirmationModal = false;
        return;
      }
      this.showSaveConfirmationModal = false;
      this.loading = true;

      const editableData = this.bookingToSave.editable;
      const updatePayload = { // Matches BookingUpdateDTO / AdminBookingUpdateDTO
        userUuid: editableData.userUuidString && editableData.userUuidString.trim() !== "" ? editableData.userUuidString.trim() : null,
        carUuid: editableData.carUuidString && editableData.carUuidString.trim() !== "" ? editableData.carUuidString.trim() : null,
        driverUuid: editableData.driverUuidString && editableData.driverUuidString.trim() !== "" ? editableData.driverUuidString.trim() : null,
        bookingStartDate: editableData.bookingStartDate,
        bookingEndDate: editableData.bookingEndDate, // This was expectedReturnedDate in editable setup
        actualReturnedDate: editableData.actualReturnedDate || null,
        status: editableData.status,
        issuerId: editableData.issuerId,
        receiverId: editableData.receiverId,
        fine: editableData.fine,
      };
      if (!updatePayload.userUuid) delete updatePayload.userUuid;
      if (!updatePayload.carUuid) delete updatePayload.carUuid;
      if (!updatePayload.driverUuid) delete updatePayload.driverUuid;

      try {
        await api.put(`/api/v1/admin/bookings/${this.bookingToSave.uuid}`, updatePayload);
        this.showSuccessModal("Booking updated successfully.");
        this.bookingToSave.editing = false;
        this.bookingToSave.editable = null;
        await this.fetchBookings();
      } catch (error) {
        this.handleApiCatchError(error, "Failed to update booking.");
      } finally {
        this.loading = false;
        this.bookingToSave = null;
      }
    },
    cancelEditBooking(booking) {
      booking.editing = false;
      booking.editable = null;
    },
    viewBookingDetails(uuid) {
      this.$router.push({ name: 'ViewBooking', params: { uuid: uuid } });
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
    this.fetchBookings();
  },
};
</script>