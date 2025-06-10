<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="isLoading" :show="true" message="Loading booking details..."/>

      <div v-if="!isLoading && booking && user && car" class="booking-profile">
        <div class="form-header">
          <h1><i class="fas fa-calendar-check"></i> View Booking</h1>
          <p class="sub-header">Booking UUID: {{ booking.uuid }}</p>
        </div>
        <hr/>

        <div class="profile-details">
          <!-- Booking Details -->
          <div class="section">
            <h3><i class="fas fa-calendar-check"></i> Booking Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Status:</label> <span>{{ formatStatus(booking.status) }}</span></div>
              <div class="detail-item"><label>Collection Date:</label>
                <span>{{ formatDisplayDateTime(booking.bookingStartDate) }}</span></div>
              <div class="detail-item"><label>Expected Return:</label>
                <span>{{ formatDisplayDateTime(booking.bookingEndDate) }}</span></div>
              <div v-if="booking.returnedDate" class.detail-item><label>Actual Return:</label>
                <span>{{ formatDisplayDateTime(booking.returnedDate) }}</span></div>
              <div v-if="booking.fine > 0" class.detail-item><label>Fine:</label> <span>${{
                  booking.fine.toFixed(2)
                }}</span></div>
              <div v-if="booking.issuer" class.detail-item><label>Issued By (ID):</label> <span>{{
                  booking.issuer
                }}</span></div>
              <div v-if="booking.receiver" class.detail-item><label>Received By (ID):</label> <span>{{
                  booking.receiver
                }}</span></div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3><i class="fas fa-user-tie"></i> Customer Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Full Name:</label> <span>{{ user.firstName }} {{ user.lastName }}</span>
              </div>
              <div class="detail-item"><label>Email:</label> <span>{{ user.email }}</span></div>
              <div class="detail-item"><label>User UUID:</label> <span>{{ user.uuid }}</span></div>
              <div v-if="user.roles && user.roles.length > 0" class="detail-item"><label>Roles:</label>
                <span>{{ user.roles.join(', ') }}</span></div>
            </div>
          </div>

          <!-- Car Details -->
          <div class="section">
            <h3><i class="fas fa-car-side"></i> Car Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Make:</label> <span>{{ car.make }}</span></div>
              <div class="detail-item"><label>Model:</label> <span>{{ car.model }}</span></div>
              <div class="detail-item"><label>Year:</label> <span>{{ car.year }}</span></div>
              <div class="detail-item"><label>Price Group:</label> <span>{{ car.priceGroup }}</span></div>
              <div class="detail-item"><label>License Plate:</label> <span>{{ car.licensePlate }}</span></div>
              <div class="detail-item"><label>Car UUID:</label> <span>{{ car.uuid }}</span></div>
              <div class="detail-item"><label>Currently Available:</label> <span>{{
                  car.available ? 'Yes' : 'No'
                }}</span></div>
            </div>
          </div>
        </div>
        <div class="button-container" >
          <button type="button" class="back-button button" @click="goBack">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </div>

      <div v-else-if="!isLoading && apiError" class="error-message-container">
        <p class="error-text">{{ failModal.message || "Failed to load booking details." }}</p>
        <button class="button deny-button" @click="goBack">Go Back</button>
      </div>

    </div>
  </div>

  <!-- Modals are typically placed at the root of the component or app for global stacking context -->
  <div class="modal-teleporter">
    <FailureModal
        key="viewBookingFailureModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailModal"
    />
  </div>
</template>

<script>
import api from "@/api";
import {formatDateTime} from '@/utils/dateUtils.js';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';

/**
 * @file ViewBooking.vue
 * @description Admin component for viewing the detailed information of a specific booking.
 * It fetches the booking data, including nested user and car details, based on a UUID
 * from the route parameters and displays it in a structured format.
 * @component AdminViewBooking
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminViewBooking',
  components: {
    LoadingModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} booking - Stores the main booking object (BookingResponseDTO) fetched from the API.
   *                                   Expected to contain nested `user` and `car` objects.
   * @property {object|null} user - Stores the user details, extracted from the nested `booking.user` object.
   * @property {object|null} car - Stores the car details, extracted from the nested `booking.car` object.
   * @property {boolean} isLoading - Flag to indicate if booking details are currently being loaded.
   * @property {boolean} apiError - Flag to indicate if an error occurred during API fetch.
   * @property {object} failModal - Controls the failure modal state ({show: boolean, message: string}).
   */
  data() {
    return {
      booking: null,
      user: null,
      car: null,
      isLoading: true,
      apiError: false,
      failModal: {show: false, message: ""},
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the detailed booking information.
   */
  async mounted() {
    await this.fetchBookingDetails();
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
     * Formats a booking status string (e.g., 'PENDING_CONFIRMATION') into a more readable title case format.
     * @param {string} status - The status string from the backend.
     * @returns {string} Formatted status string (e.g., 'Pending Confirmation') or 'N/A'.
     */
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    /**
     * Fetches detailed information for a specific booking from the API,
     * using the booking UUID from the current route parameters.
     * The booking data is expected to contain nested user and car details.
     * Manages loading and error states.
     * @async
     * @returns {void}
     */
    async fetchBookingDetails() {
      this.isLoading = true;
      this.apiError = false;
      this.failModal.show = false;

      const bookingUuidFromRoute = this.$route.params.uuid;
      if (!bookingUuidFromRoute) {
        console.error("AdminViewBooking: No booking UUID provided in route parameters.");
        this.failModal.message = "No booking specified to view. Please check the URL.";
        this.failModal.show = true;
        this.isLoading = false;
        this.apiError = true;
        return;
      }

      try {
        console.log(`AdminViewBooking: Fetching booking with UUID: ${bookingUuidFromRoute}`);
        const response = await api.get(`/api/v1/admin/bookings/${bookingUuidFromRoute}`);

        if (response.data && response.data.status === "success" && response.data.data) {
          this.booking = response.data.data;
          console.log("AdminViewBooking - Booking data:", this.booking);

          // Extract nested user and car details if present in the booking object
          if (this.booking.user) { // Assuming 'user' is a nested object in booking DTO
            this.user = this.booking.user;
            console.log("AdminViewBooking - User data (from booking):", this.user);
          } else {
            console.warn("AdminViewBooking - User details missing in booking response.");
            // Set user to an empty object or handle as an error if user is critical
            this.user = {};
          }

          if (this.booking.car) { // Assuming 'car' is a nested object in booking DTO
            this.car = this.booking.car;
            console.log("AdminViewBooking - Car data (from booking):", this.car);
          } else {
            console.warn("AdminViewBooking - Car details missing in booking response.");
            this.car = {};
          }
          // Handle driver similarly if it's part of the booking DTO and needed
          // if (this.booking.driver) this.driver = this.booking.driver;

        } else { // Handle non-success status or unexpected response structure
          this.handleApiResponseError(response.data, "Failed to load booking details: Unexpected server response.");
          this.apiError = true;
        }
      } catch (error) { // Handle HTTP errors or network issues
        this.handleApiCatchError(error, "An error occurred while fetching the booking details.");
        this.apiError = true;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
    /**
     * Closes the failure modal.
     * @returns {void}
     */
    closeFailModal() {
      this.failModal.show = false;
    },
    /**
     * General error handler for API responses that return success HTTP status but indicate an error in the body.
     * @param {object|null} responseData - The `data` part of the Axios API response.
     * @param {string} defaultMessage - A default error message to use.
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
      console.error("API Response Error (AdminViewBooking):", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
    },
    /**
     * General error handler for API calls that fail (e.g., network error, HTTP 4xx/5xx status).
     * @param {Error} error - The error object from the `catch` block.
     * @param {string} defaultMessage - A default error message to use.
     * @returns {void}
     */
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AdminViewBooking):", error.response || error.message || error);
      let errorMessage = defaultMessage;
      if (error.response?.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors?.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200 && apiResponse.length > 0) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText) {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check network connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
    },
  },
};
</script>

<style scoped>
.card-container { /* Styles from UserProfile */
}

.form-container { /* Styles from UserProfile */
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-header h1 {
  font-size: 1.8em;
  margin-bottom: 5px;
}

.form-header h1 i {
  margin-right: 10px;
  color: #007bff;
}

.sub-header {
  font-size: 0.9em;
  color: #6c757d;
  margin-top: 0;
}

.profile-details {
  padding-top: 15px;
}

.section {
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  background-color: var(--bs-gray-100);
}

.section h3 {
  font-size: 1.3em;
  color: #0056b3; /* Darker blue for section titles */
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff30;
}

.section h3 i {
  margin-right: 8px;
}

.section-hr {
  display: none; /* Replaced by h3 border-bottom */
}

.detail-grid { /* Use grid for better alignment */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive columns */
  gap: 10px 20px; /* Row and column gap */
}

.detail-item {
  font-size: 0.95rem;
  color: #333;
  padding: 5px 0;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  margin-right: 8px;
  min-width: 120px; /* Align labels */
  display: inline-block;
}

.detail-item span {
  color: #222;
}

.loading-container, .error-message-container {
  text-align: center;
  padding: 40px;
}

.error-text {
  color: #dc3545;
  font-weight: bold;
}

.modal-teleporter {
  /* For global modal positioning if needed */
}

.button { /* Basic button styling */
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
}

.deny-button {
  background-color: #6c757d;
  color: white;
}

.deny-button:hover {
  background-color: #5a6268;
}

/* Styles for card-container-admin and other shared classes should come from your global styles or UsersManagement.vue style */
</style>