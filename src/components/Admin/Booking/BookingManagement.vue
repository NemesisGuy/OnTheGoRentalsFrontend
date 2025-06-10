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
<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Not used in template, Shimmer is used
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ShimmerAdminTable from "@/components/Main/Loaders/ShimmerAdminTable.vue";
import api from "@/api.js";
import { formatDateTime, formatInputDateTime as formatInputDateTimeUtil } from '@/utils/dateUtils.js'; // Aliased for clarity

/**
 * @constant {Array<string>} RENTAL_STATUS_OPTIONS
 * @description Defines the possible string values for booking statuses,
 * aligning with backend enum or defined states. Used for status selection in edit mode.
 */
const RENTAL_STATUS_OPTIONS = ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'USER_CANCELLED', 'ADMIN_CANCELLED', 'REJECTED', 'NO_SHOW', 'FULFILLED'];

/**
 * @file BookingManagement.vue
 * @description Admin component for managing all bookings.
 * Provides functionalities for viewing, searching, sorting, inline editing, and deleting bookings.
 * It uses modals for confirmations and feedback.
 * @component AdminBookingManagement
 */
export default {
  name: "AdminBookingManagement",
  components: {
    ConfirmationModal,
    // LoadingModal, // Not directly used in template; ShimmerAdminTable and data.loading are used.
    SuccessModal,
    FailureModal,
    ShimmerAdminTable,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} allBookings - Stores all fetched booking entries, each augmented with `editing` and `editable` fields.
   * @property {Array<object>} bookingsToDisplay - Filtered and sorted list of bookings for table display.
   * @property {string} searchQuery - Current search query for filtering bookings.
   * @property {boolean} loading - Indicates if data is being fetched or an operation is in progress. Controls Shimmer and general loading states.
   * @property {boolean} apiError - Flag indicating if a generic API error occurred, used to display error messages.
   * @property {boolean} showDeleteConfirmationModal - Controls visibility of the delete confirmation modal.
   * @property {boolean} showSaveConfirmationModal - Controls visibility of the save/update confirmation modal.
   * @property {object|null} bookingToDelete - Stores the booking object marked for deletion.
   * @property {object|null} bookingToSave - Stores the booking object marked for saving (contains `editable` data).
   * @property {object} successModal - Controls the success modal state ({show: boolean, message: string}).
   * @property {object} failModal - Controls the failure modal state ({show: boolean, message: string}).
   * @property {string} currentSortColumn - The key (can be a dot-separated nested path) for the property to sort by.
   * @property {string} currentSortDirection - The direction of sorting ('asc' or 'desc').
   * @property {Array<string>} rentalStatusOptions - List of available booking statuses for the edit mode select dropdown.
   */
  data() {
    return {
      allBookings: [],
      bookingsToDisplay: [],
      searchQuery: "",
      loading: true, // Start with loading true as data is fetched on created/mounted
      apiError: false,
      showDeleteConfirmationModal: false,
      showSaveConfirmationModal: false,
      bookingToDelete: null,
      bookingToSave: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'bookingStartDate',
      currentSortDirection: 'desc', // Default to newest bookings first
      rentalStatusOptions: RENTAL_STATUS_OPTIONS,
    };
  },
  /**
   * Lifecycle hook called when the component is created.
   * Fetches the initial list of bookings.
   */
  created() {
    this.fetchBookings();
  },
  methods: {
    /**
     * Formats a date-time string for display using a utility function.
     * @param {string} dateTimeString - The ISO date-time string.
     * @returns {string} Human-readable formatted date-time string or 'N/A'.
     */
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString);
    },
    /**
     * Formats a date-time string into a format suitable for `datetime-local` input fields.
     * @param {string} dateTimeString - The ISO date-time string.
     * @returns {string} Formatted date-time string (YYYY-MM-DDTHH:mm) or empty string if input is invalid.
     */
    formatInputDateTime(dateTimeString) {
        return formatInputDateTimeUtil(dateTimeString);
    },
    /**
     * Formats a booking status string (e.g., 'PENDING_CONFIRMATION') into a more readable title case format.
     * @param {string} status - The status string from the backend.
     * @returns {string} Formatted status string (e.g., 'Pending Confirmation') or 'N/A'.
     */
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    /**
     * Returns a CSS class string based on the booking status for styling status badges in the table.
     * @param {string} status - The booking status string.
     * @returns {string} CSS class (e.g., 'status-confirmed') or 'status-unknown'.
     */
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-${status.toLowerCase().replace(/_/g, '-')}`;
    },
    /**
     * Fetches all bookings from the admin API endpoint.
     * Augments each booking with `editing` (boolean) and `editable` (null or object for temp edits) properties for UI state.
     * Calls `applyFiltersAndSort` after fetching. Manages loading and error states.
     * @async
     * @returns {void}
     */
    async fetchBookings() {
      this.loading = true;
      this.apiError = false; // Reset API error state
      this.failModal.show = false; // Hide any previous failure modals
      try {
        const response = await api.get(`/api/v1/admin/bookings`);
        if (response.data && response.data.status === "success") {
          const rawData = response.data.data;
          this.allBookings = Array.isArray(rawData) ? rawData.map(booking => ({
            ...booking,
            editing: false,
            editable: null
          })) : [];
        } else { // Handle non-success status in response body
          this.handleApiResponseError(response.data, "Failed to fetch bookings: Server indicated an issue.");
          this.allBookings = []; // Ensure list is empty on error
        }
      } catch (error) { // Handle HTTP errors (4xx, 5xx, network issues)
        this.handleApiCatchError(error, "An error occurred while fetching bookings from the server.");
        this.allBookings = []; // Ensure list is empty on error
      } finally {
        this.applyFiltersAndSort();
        this.loading = false;
      }
    },
    /**
     * Safely gets a property value from an object, supporting dot-separated nested paths (e.g., 'user.lastName').
     * Returns an empty string if the path is invalid or the value at any point in the path is null or undefined.
     * @param {object|null} object - The object to retrieve the property from.
     * @param {string} key - The key or dot-separated path of the property.
     * @returns {any} The property value if found, otherwise an empty string.
     */
    getPropertyValue(object, key) {
      if (object == null || typeof key !== 'string' || key.trim() === '') return '';
      const keys = key.split('.');
      let value = object;
      try {
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return ''; // Path broken or property doesn't exist at this level
          }
        }
      } catch (e) {
        console.warn(`Error accessing property "${key}" in getPropertyValue:`, e);
        return '';
      }
      return value === null || typeof value === 'undefined' ? '' : value;
    },
    /**
     * Applies current search filters to the `allBookings` list and then sorts the resulting list.
     * Updates the `bookingsToDisplay` property which is used by the template's v-for.
     * @returns {void}
     */
    applyFiltersAndSort() {
      let processedList = [...this.allBookings];
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const lowerQuery = this.searchQuery.toLowerCase().trim();
        processedList = processedList.filter(b =>
            (this.getPropertyValue(b, 'uuid')?.toLowerCase().includes(lowerQuery)) ||
            (this.getPropertyValue(b, 'status')?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(b.bookingStartDate)?.toLowerCase().includes(lowerQuery)) ||
            (this.formatDisplayDateTime(b.bookingEndDate)?.toLowerCase().includes(lowerQuery)) ||
            (this.getPropertyValue(b, 'user.firstName')?.toLowerCase().includes(lowerQuery)) ||
            (this.getPropertyValue(b, 'user.lastName')?.toLowerCase().includes(lowerQuery)) ||
            (this.getPropertyValue(b, 'car.make')?.toLowerCase().includes(lowerQuery)) ||
            (this.getPropertyValue(b, 'car.model')?.toLowerCase().includes(lowerQuery))
        );
      }
      this.sortList(processedList); // Pass the filtered list to be sorted
    },
    /**
     * Sorts a given list of booking entries based on `currentSortColumn` and `currentSortDirection`.
     * Updates `bookingsToDisplay`. Handles sorting for strings, numbers, and dates.
     * @param {Array<object>} listToSort - The list of booking entries to sort.
     * @returns {void}
     */
    sortList(listToSort) {
      if (this.currentSortColumn) {
        listToSort.sort((a, b) => {
          let valA = this.getPropertyValue(a, this.currentSortColumn);
          let valB = this.getPropertyValue(b, this.currentSortColumn);

          let comparison = 0;
          if (this.currentSortColumn.toLowerCase().includes('date')) { // Date sorting
             valA = valA ? new Date(valA).getTime() : 0; // Convert valid date strings to timestamps
             valB = valB ? new Date(valB).getTime() : 0;
             comparison = valA - valB;
          } else if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB)) && isFinite(valA) && isFinite(valB) && (typeof valA !== 'string' || typeof valB !== 'string')) { // Numeric sort
             comparison = Number(valA) - Number(valB);
          } else { // Default to locale-aware string comparison
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          }
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.bookingsToDisplay = listToSort;
    },
    /**
     * Sets the sort column and direction for the bookings table, then re-applies filtering and sorting.
     * @param {string} sortKey - The key (can be a dot-separated nested path) of the booking property to sort by.
     * @returns {void}
     */
    sortBookings(sortKey) {
      if (this.currentSortColumn === sortKey) {
        this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSortColumn = sortKey;
        this.currentSortDirection = 'asc';
      }
      this.applyFiltersAndSort();
    },
    /**
     * Resets the search query input and re-applies filters and sorting to display all bookings.
     * @returns {void}
     */
    resetSearch() {
      this.searchQuery = "";
      this.applyFiltersAndSort();
    },
    /**
     * Initiates the deletion process for a booking. Clones the booking data to `bookingToDelete`
     * and shows the delete confirmation modal.
     * @param {object} booking - The booking object intended for deletion.
     * @returns {void}
     */
    initiateDeleteBooking(booking) {
      this.bookingToDelete = { ...booking };
      this.showDeleteConfirmationModal = true;
    },
    /**
     * Executes the deletion of the booking (identified by `bookingToDelete.uuid`) after user confirmation.
     * Makes an API call to delete (soft-delete) the booking. Refreshes the bookings list on success.
     * Manages loading states and shows success/failure modals.
     * @async
     * @returns {void}
     */
    async executeDeleteBooking() {
      if (!this.bookingToDelete?.uuid) {
        console.warn("ExecuteDeleteBooking called without a valid bookingToDelete object or UUID.");
        this.showDeleteConfirmationModal = false;
        this.bookingToDelete = null; // Reset
        return;
      }
      // Consider a specific loading state for this action if it can take time, e.g., this.isDeletingBooking = true
      this.loading = true;
      this.showDeleteConfirmationModal = false;
      try {
        await api.delete(`/api/v1/admin/bookings/${this.bookingToDelete.uuid}`);
        this.showSuccessModal("Booking successfully deleted.");
        await this.fetchBookings();
      } catch (error) {
        this.handleApiCatchError(error, "Failed to delete the booking.");
      } finally {
        this.loading = false;
        this.bookingToDelete = null; // Reset after attempt
      }
    },
    /**
     * Cancels the booking deletion process. Hides the confirmation modal and resets `bookingToDelete`.
     * @returns {void}
     */
    cancelDeleteBooking() {
      this.bookingToDelete = null;
      this.showDeleteConfirmationModal = false;
    },
    /**
     * Enables inline editing mode for a specific booking.
     * Initializes `booking.editable` with current values from the booking,
     * formatting dates appropriately for `datetime-local` input fields.
     * @param {object} booking - The booking object to be edited.
     * @returns {void}
     */
    startEditBooking(booking) {
      booking.editable = { // Populate with all fields expected by AdminBookingUpdateDTO
        userUuidString: this.getPropertyValue(booking, 'user.uuid'),
        carUuidString: this.getPropertyValue(booking, 'car.uuid'),
        driverUuidString: this.getPropertyValue(booking, 'driver.uuid'),
        bookingStartDate: this.formatInputDateTime(booking.bookingStartDate),
        bookingEndDate: this.formatInputDateTime(booking.bookingEndDate),
        actualReturnedDate: this.formatInputDateTime(booking.returnedDate),
        status: booking.status,
        issuerId: this.getPropertyValue(booking, 'issuer.uuid') || this.getPropertyValue(booking, 'issuer'), // Handle if issuer is object or just ID string
        receiverId: this.getPropertyValue(booking, 'receiver.uuid') || this.getPropertyValue(booking, 'receiver'),
        fine: booking.fine !== null && booking.fine !== undefined ? parseFloat(booking.fine) : 0.0,
      };
      booking.editing = true;
    },
    /**
     * Initiates the save process for an edited booking by setting `bookingToSave`
     * and showing the save confirmation modal.
     * @param {object} booking - The booking object (which includes the `editable` property with changes).
     * @returns {void}
     */
    confirmSaveBooking(booking) {
      this.bookingToSave = booking;
      this.showSaveConfirmationModal = true;
    },
    /**
     * Cancels the booking save process from the confirmation modal. Resets `bookingToSave`.
     * @returns {void}
     */
    cancelSaveBooking() {
      this.bookingToSave = null;
      this.showSaveConfirmationModal = false;
    },
    /**
     * Executes the update of the booking after user confirmation from the modal.
     * Constructs a payload from `bookingToSave.editable` data and PUTs it to the API.
     * Refreshes the bookings list on success. Manages loading and shows feedback modals.
     * @async
     * @returns {void}
     */
    async executeUpdateBooking() {
      if (!this.bookingToSave?.editable || !this.bookingToSave?.uuid) {
        console.warn("ExecuteUpdateBooking called without valid bookingToSave or editable data.");
        this.showSaveConfirmationModal = false;
        this.bookingToSave = null;
        this.showFailureModal("Cannot save booking: Essential data for update is missing.");
        return;
      }
      this.showSaveConfirmationModal = false;
      this.loading = true;

      const editableData = this.bookingToSave.editable;
      const updatePayload = {
        userUuid: editableData.userUuidString?.trim() || null,
        carUuid: editableData.carUuidString?.trim() || null,
        driverUuid: editableData.driverUuidString?.trim() || null,
        bookingStartDate: editableData.bookingStartDate,
        bookingEndDate: editableData.bookingEndDate,
        actualReturnedDate: editableData.actualReturnedDate || null,
        status: editableData.status,
        issuerId: editableData.issuerId || null,
        receiverId: editableData.receiverId || null,
        fine: editableData.fine !== null && editableData.fine !== undefined ? parseFloat(editableData.fine) : null,
      };

      // Clean payload: remove null UUIDs if backend expects them to be absent vs. null
      if (updatePayload.userUuid === null) delete updatePayload.userUuid;
      if (updatePayload.carUuid === null) delete updatePayload.carUuid;
      if (updatePayload.driverUuid === null) delete updatePayload.driverUuid;

      try {
        await api.put(`/api/v1/admin/bookings/${this.bookingToSave.uuid}`, updatePayload);
        this.showSuccessModal("Booking updated successfully.");
        await this.fetchBookings(); // Refresh list which also resets editing states
      } catch (error) {
        this.handleApiCatchError(error, "Failed to update the booking.");
        // Optionally, keep editing mode active on failure by not calling fetchBookings or by resetting `editing` flag manually
        // if (this.bookingToSave) this.bookingToSave.editing = true;
      } finally {
        this.loading = false;
        this.bookingToSave = null;
      }
    },
    /**
     * Cancels inline editing mode for a booking, discarding any changes made in `booking.editable`.
     * @param {object} booking - The booking object.
     * @returns {void}
     */
    cancelEditBooking(booking) {
      booking.editing = false;
      booking.editable = null;
    },
    /**
     * Navigates to a detailed view page for a specific booking.
     * @param {string} uuid - The UUID of the booking to view.
     * @returns {void}
     */
    viewBookingDetails(uuid) {
      this.$router.push({ name: 'ViewBooking', params: { uuid: uuid } }); // Ensure 'ViewBooking' is a valid admin route name
    },
    /** Helper method to show the success modal with a custom message. */
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    /** Closes the success modal. */
    closeSuccessModal() { this.successModal.show = false; },
    /** Closes the failure modal. */
    closeFailModal() { this.failModal.show = false; },
    /**
     * General error handler for API responses that return success HTTP status but indicate an error in the body.
     * @param {object|null} responseData - The `data` part of the Axios API response.
     * @param {string} defaultMessage - A default error message to use.
     * @returns {void}
     */
    handleApiResponseError(responseData, defaultMessage) {
        let errorMsg = defaultMessage;
        if (responseData?.errors?.length > 0) { errorMsg = responseData.errors.map(e => e.message || e.field).join(', '); }
        else if (responseData?.message) { errorMsg = responseData.message; }
        else if (typeof responseData === 'string' && responseData.length < 200 && responseData.length > 0) { errorMsg = responseData; }
        this.failModal = { show: true, message: errorMsg }; this.apiError = true;
        console.error("API Response Error (AdminBookingManagement):", errorMsg, responseData);
    },
    /**
     * General error handler for API calls that fail (e.g., network error, HTTP 4xx/5xx status).
     * @param {Error} error - The error object from the `catch` block.
     * @param {string} defaultMessage - A default error message to use.
     * @returns {void}
     */
    handleApiCatchError(error, defaultMessage) {
        let errorMessage = defaultMessage;
        if (error.response?.data) {
            const apiResponse = error.response.data;
            if (apiResponse.errors?.length > 0) { errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; '); }
            else if (typeof apiResponse === 'string' && apiResponse.length < 200 && apiResponse.length > 0) { errorMessage = apiResponse; }
            else if (apiResponse.message) { errorMessage = apiResponse.message; }
            else if (error.response.statusText) { errorMessage = `Error ${error.response.status}: ${error.response.statusText}`; }
        } else if (error.request) { errorMessage = "No response from server. Please check network connection."; }
        else if (error.message) { errorMessage = error.message; }
        this.failModal = { show: true, message: errorMessage }; this.apiError = true;
        console.error("API Catch Error (AdminBookingManagement):", errorMessage, error.response || error.message || error); // Log full error object for more details
     },
  },
};
</script>