<template>
  <div class="card-container">
    <div class="form-container"> <!-- Your global form container style -->
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

      <form ref="bookingForm" @submit.prevent="initiateBookingCreation">
        <div class="form-header">
          <h2><i class="fas fa-calendar-plus"></i> Create Booking</h2>
          <p v-if="carUuid && selectedCarDetails">
            For Car: {{ selectedCarDetails.make }} {{ selectedCarDetails.model }} ({{ selectedCarDetails.year }})
          </p>
        </div>

        <div class="form-group">
          <label for="userDisplay">User:</label>
          <input
              id="userDisplay"
              type="text"
              :value="currentUser && currentUser.email ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})` : 'Loading user...'"
              readonly
              class="form-control-plaintext"
              title="Current logged-in user"
          />
        </div>

        <div class="form-group">
          <label for="car">Select Car:</label>
          <select id="car" v-model="bookingRequest.carUuid" name="carUuid" class="form-select" required>
            <option disabled value="">Please select a car</option>
            <option v-for="car in availableCars" :key="car.uuid" :value="car.uuid">
              {{ car.make }} {{ car.model }} ({{ car.year }}) - {{ car.priceGroup }}
            </option>
          </select>
          <small v-if="validationAttempted && !bookingRequest.carUuid" class="form-text text-danger">Car selection is required.</small>
        </div>

        <div class="form-group">
          <label for="bookingStartDate">Booking Start Date & Time:</label>
          <input id="bookingStartDate" v-model="bookingRequest.bookingStartDate" name="bookingStartDate" type="datetime-local" class="form-control" required>
          <small v-if="validationAttempted && !bookingRequest.bookingStartDate" class="form-text text-danger">Start date is required.</small>
        </div>

        <div class="form-group">
          <label for="bookingEndDate">Booking End Date & Time:</label>
          <input id="bookingEndDate" v-model="bookingRequest.bookingEndDate" name="bookingEndDate" type="datetime-local" class="form-control" required>
          <small v-if="validationAttempted && !bookingRequest.bookingEndDate" class="form-text text-danger">End date is required.</small>
        </div>

        <!-- Optional: Driver Selection -->
        <!-- <div class="form-group">
          <label for="driver">Select Driver (Optional):</label>
          <select id="driver" v-model="bookingRequest.driverUuid" name="driverUuid" class="form-select">
            <option :value="null">-- No Driver Preference --</option>
            <option v-for="driver in availableDrivers" :key="driver.uuid" :value="driver.uuid">
              {{ driver.firstName }} {{ driver.lastName }}
            </option>
          </select>
        </div> -->

        <div v-if="validationErrorMessage" class="error-message alert alert-danger">{{ validationErrorMessage }}</div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="loadingModal.show || !currentUser.uuid || !bookingRequest.carUuid">
            <i class="fas fa-check"></i> Create Booking
          </button>
          <button type="button" class="back-button button" @click="goBack" :disabled="loadingModal.show">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body-container">
    <ConfirmationModal
        key="bookingCreationConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Booking Creation"
        @cancel="cancelBookingCreation"
        @confirm="confirmAndCreateBooking"
    >
      <template #default>
        <p>Are you sure you want to create this booking with the following details?</p>
        <hr>
        <p><strong>User:</strong> {{ currentUser && currentUser.email ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})` : '' }}</p>
        <p><strong>Car:</strong> {{ selectedCarDetails ? `${selectedCarDetails.make} ${selectedCarDetails.model} (${selectedCarDetails.year}) - ${selectedCarDetails.priceGroup}` : 'N/A' }}</p>
        <p><strong>Collection Date:</strong> {{ formatDisplayDateTime(bookingRequest.bookingStartDate) }}</p>
        <p><strong>Return Date:</strong> {{ formatDisplayDateTime(bookingRequest.bookingEndDate) }}</p>
        <!-- <p v-if="selectedDriverDetails"><strong>Driver:</strong> {{ selectedDriverDetails.firstName }} {{ selectedDriverDetails.lastName }}</p> -->
        <hr>
        <p><b>Note:</b> This will reserve the car for the selected dates.</p>
      </template>
    </ConfirmationModal>

    <SuccessModal
        key="bookingSuccessModal"
        :message="successModal.message"
        :show="successModal.show"
        @ok="closeModalAndRedirectToMyBookings"
        @close="closeModalAndRedirectToMyBookings"
    />
    <FailureModal
        key="bookingFailureModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailureModal"
    />
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime, formatInputDateTime } from '@/utils/dateUtils';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

const log = console;

/**
 * @file CreateBookingPage.vue
 * @description Allows users to create a new car booking. It can be pre-filled with a car
 * selection if a `carUuid` is passed as a route parameter. Fetches current user
 * profile and available cars. Includes validation and a confirmation step.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-05-31 (Updated)
 */
export default {
  name: "CreateBookingPage",
  components: {
    ConfirmationModal,
    SuccessModal,
    FailureModal,
    LoadingModal,
  },
  props: {
    /**
     * Optional UUID of a car to pre-select, typically passed as a route parameter
     * when navigating from a car list.
     */
    carUuid: {
      type: String,
      required: false,
      default: null,
    }
  },
  data() {
    return {
      /** @type {Array<Object>} List of available cars for selection. */
      availableCars: [],
      /**
       * @type {Object} Holds the data for the booking request payload.
       * @property {string|null} userUuid - UUID of the user making the booking.
       * @property {string} carUuid - UUID of the selected car.
       * @property {string} bookingStartDate - Start date/time of the booking.
       * @property {string} bookingEndDate - End date/time of the booking.
       * @property {string|null} driverUuid - Optional UUID of a selected driver.
       */
      bookingRequest: {
        userUuid: null,
        carUuid: "", // Bound to car select dropdown
        bookingStartDate: this.getDefaultDateTime(1, 9), // Default to tomorrow 9 AM
        bookingEndDate: this.getDefaultDateTime(3, 17),   // Default to 2 days after tomorrow 5 PM
        driverUuid: null,
      },
      /** @type {Object} Stores details of the currently authenticated user. */
      currentUser: {
        uuid: null,
        firstName: '',
        lastName: '',
        email: ''
      },
      /** @type {Object} Controls the loading modal state and message. */
      loadingModal: { show: false, message: "Processing..." },
      /** @type {boolean} Indicates if initial page data is being loaded. */
      initialDataLoading: true,
      /** @type {string} Stores client-side validation error messages. */
      validationErrorMessage: "",
      /** @type {boolean} Flag to control when to show validation messages. */
      validationAttempted: false,
      /** @type {boolean} Controls visibility of the booking confirmation modal. */
      showConfirmationModal: false,
      /** @type {Object} Controls the success feedback modal. */
      successModal: { show: false, message: "" },
      /** @type {Object} Controls the failure feedback modal. */
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    /**
     * Computes details of the selected car based on `bookingRequest.carUuid`.
     * @returns {Object|null} The selected car object or null.
     */
    selectedCarDetails() {
      if (!this.bookingRequest.carUuid) return null;
      return this.availableCars.find(car => car.uuid === this.bookingRequest.carUuid);
    }
  },
  /**
   * Lifecycle hook called when the component is created.
   * Fetches initial data required for the booking form.
   */
  created() {
    log.debug("CreateBookingPage: Component created. Initial carUuid prop from route:", this.$props.carUuid); // Access prop directly
    this.fetchAllInitialData();
  },
  methods: {
    /**
     * Formats a date-time string for display purposes.
     * @param {string} dateTimeString - The ISO date-time string.
     * @returns {string} Human-readable formatted date-time string or 'N/A'.
     */
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString);
    },

    /**
     * Generates a default date-time string in YYYY-MM-DDTHH:MM format.
     * @param {number} addDays - Number of days to add to the current date.
     * @param {number} startHour - The hour for the default time.
     * @param {number} startMinute - The minute for the default time.
     * @returns {string} Formatted date-time string suitable for datetime-local input.
     */
    getDefaultDateTime(addDays = 0, startHour = 9, startMinute = 0) {
      const now = new Date();
      if (addDays > 0) {
        now.setDate(now.getDate() + addDays);
      }
      now.setHours(startHour, startMinute, 0, 0);
      return formatInputDateTime(now);
    },

    /**
     * Fetches all necessary data on component creation: current user and available cars.
     * Attempts to pre-select a car if `carUuid` prop is provided.
     */
    fetchAllInitialData() {
      this.initialDataLoading = true;
      this.loadingModal.show = true;
      this.loadingModal.message = "Loading booking information...";
      log.debug("CreateBookingPage: Fetching all initial data...");

      Promise.all([
        this.fetchCurrentUserProfileInternal(),
        this.fetchAvailableCarsListInternal()
      ])
          .then(() => {
            log.debug("CreateBookingPage: User profile and available cars fetched.");
            this.preselectCarFromProp(); // Attempt pre-selection now that cars are loaded
          })
          .catch(error => {
            log.error("CreateBookingPage: Error during one or more initial data fetches:", error);
            // Individual fetch methods already show failure modals for API errors.
            // This catch is for any promise rejection from Promise.all itself.
            if (!this.failModal.show) { // Show a general modal if no specific one was shown
              this.showFailureModal("Could not load all necessary data. Please try refreshing.");
            }
          })
          .finally(() => {
            this.loadingModal.show = false;
            this.initialDataLoading = false;
            log.debug("CreateBookingPage: Initial data fetching sequence complete.");
          });
    },

    /**
     * Fetches the profile of the currently authenticated user.
     * @returns {Promise} Resolves on successful fetch, rejects on error.
     */
    fetchCurrentUserProfileInternal() {
      log.debug("CreateBookingPage: Fetching current user profile...");
      return api.get("/api/v1/users/me/profile")
          .then(response => {
            if (response.data && response.data.status === "success" && response.data.data) {
              this.currentUser = response.data.data;
              this.bookingRequest.userUuid = this.currentUser.uuid;
              if (!this.currentUser.uuid) {
                log.error("CreateBookingPage: Fetched user profile is missing UUID:", this.currentUser);
                this.showFailureModal("User profile data is incomplete. Cannot create booking.");
                throw new Error("User profile data is incomplete."); // Propagate error
              }
              log.info("CreateBookingPage: Current user profile fetched:", this.currentUser.email);
            } else {
              this.handleApiResponseError(response.data, "Failed to load your user profile correctly.");
              throw new Error("Failed to load user profile - unexpected response.");
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "Failed to fetch your profile. Please log in again.");
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              this.$router.push({ name: 'Login' });
            }
            throw error; // Re-throw for Promise.all
          });
    },

    /**
     * Fetches the list of cars currently available for booking.
     * @returns {Promise} Resolves on successful fetch, rejects on error.
     */
    fetchAvailableCarsListInternal() {
      log.debug("CreateBookingPage: Fetching available cars list...");
      return api.get("/api/v1/cars/available")
          .then(response => {
            if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
              this.availableCars = response.data.data;
              log.info("CreateBookingPage: Available cars fetched:", this.availableCars.length);
            } else if (response.data && response.data.status === "success" && (response.data.data === null || (Array.isArray(response.data.data) && response.data.data.length === 0))) {
              this.availableCars = [];
              log.info("CreateBookingPage: No available cars found (API returned null or empty data).");
            } else {
              this.handleApiResponseError(response.data, "Failed to load available cars list (unexpected structure).");
              this.availableCars = [];
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "An error occurred while fetching available cars.");
            this.availableCars = [];
            throw error; // Re-throw for Promise.all
          });
    },

    /**
     * If a `carUuid` prop is passed (from route params), this method attempts to
     * set it as the selected car in the form, provided the car exists in the fetched available cars.
     */
    preselectCarFromProp() {
      const routeCarUuid = this.$props.carUuid; // Access prop correctly
      log.debug(`CreateBookingPage: Attempting to pre-select car from prop. Prop carUuid: ${routeCarUuid}`);
      if (routeCarUuid && this.availableCars.length > 0) {
        const carToSelect = this.availableCars.find(car => car.uuid === routeCarUuid);
        if (carToSelect) {
          this.bookingRequest.carUuid = routeCarUuid;
          log.info("CreateBookingPage: Car pre-selected from route parameter:", routeCarUuid);
        } else {
          log.warn(`CreateBookingPage: Car with UUID ${routeCarUuid} (from route) not found in available cars list.`);
          this.showFailureModal(`The car (ID: ${routeCarUuid.substring(0,8)}...) you selected is no longer available or does not exist. Please choose another car.`);
        }
      } else if (routeCarUuid) {
        log.warn("CreateBookingPage: carUuid prop is present but availableCars list is empty. Cannot pre-select.");
        // Potentially show a transient message if car list is known to be empty after fetch.
      } else {
        log.debug("CreateBookingPage: No carUuid prop provided, or available cars not yet loaded for pre-selection.");
      }
    },

    /**
     * Validates the booking form inputs before proceeding to confirmation.
     * @returns {boolean} True if all required inputs are valid, false otherwise.
     */
    validateInputs() {
      this.validationAttempted = true;
      this.validationErrorMessage = "";

      if (!this.currentUser || !this.currentUser.uuid) {
        this.validationErrorMessage = "User information is missing. Please try logging in again.";
        log.warn("Validation failed: Missing current user UUID.");
        return false;
      }
      if (!this.bookingRequest.carUuid) {
        this.validationErrorMessage = "Please select a car.";
        log.warn("Validation failed: No car selected.");
        return false;
      }
      if (!this.bookingRequest.bookingStartDate) {
        this.validationErrorMessage = "Please select a collection date and time.";
        log.warn("Validation failed: Booking start date missing.");
        return false;
      }
      if (!this.bookingRequest.bookingEndDate) {
        this.validationErrorMessage = "Please select a return date and time.";
        log.warn("Validation failed: Booking end date missing.");
        return false;
      }

      const issueDateTime = new Date(this.bookingRequest.bookingStartDate);
      const returnDateTime = new Date(this.bookingRequest.bookingEndDate);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - (5 * 60 * 1000));

      if (issueDateTime < fiveMinutesAgo) {
        this.validationErrorMessage = "Collection date and time cannot be significantly in the past.";
        log.warn("Validation failed: Start date is in the past. Start: {}, Limit: {}", issueDateTime, fiveMinutesAgo);
        return false;
      }
      if (returnDateTime <= issueDateTime) {
        this.validationErrorMessage = "Return date and time must be after the collection date and time.";
        log.warn("Validation failed: End date is not after start date. Start: {}, End: {}", issueDateTime, returnDateTime);
        return false;
      }
      const minDurationMillis = 59 * 60 * 1000; // Approx 1 hour
      if (returnDateTime.getTime() - issueDateTime.getTime() < minDurationMillis) {
        this.validationErrorMessage = "Minimum booking duration is 1 hour.";
        log.warn("Validation failed: Booking duration less than 1 hour.");
        return false;
      }
      return true;
    },

    /**
     * Initiates the booking creation flow: validates inputs and shows confirmation modal.
     */
    initiateBookingCreation() {
      log.info("CreateBookingPage: Initiate booking creation called.");
      if (!this.validateInputs()) {
        this.showFailureModal(this.validationErrorMessage);
        return;
      }
      log.debug("CreateBookingPage: Inputs validated successfully. Showing confirmation modal.");
      this.showConfirmationModal = true;
    },

    /**
     * Proceeds with booking creation after user confirmation.
     * Submits the booking payload to the backend API.
     */
    confirmAndCreateBooking() {
      this.showConfirmationModal = false;
      this.loadingModal.show = true;
      this.loadingModal.message = "Submitting your booking...";

      const payload = {
        userUuid: this.bookingRequest.userUuid,
        carUuid: this.bookingRequest.carUuid,
        bookingStartDate: this.bookingRequest.bookingStartDate,
        bookingEndDate: this.bookingRequest.bookingEndDate,
        driverUuid: this.bookingRequest.driverUuid || null, // Optional
      };
      log.info("CreateBookingPage: Confirming and creating booking with payload:", payload);

      api.post("/api/v1/bookings", payload)
          .then(response => {
            this.loadingModal.show = false;
            if (response.data && response.data.status === "success" && response.data.data) {
              const createdBooking = response.data.data;
              log.info("CreateBookingPage: Booking created successfully via API. Response DTO:", createdBooking);
              this.successModal.message = `Booking for ${createdBooking.car?.make || 'Car'} ${createdBooking.car?.model || ''} (ID: ${createdBooking.uuid ? createdBooking.uuid.substring(0,8) : 'N/A'}...) has been ${this.formatStatus(createdBooking.status).toLowerCase()}!`;
              this.successModal.show = true;
            } else {
              this.handleApiResponseError(response.data, "Failed to create booking due to an unexpected server response.");
            }
          })
          .catch(error => {
            this.loadingModal.show = false;
            this.handleApiCatchError(error, "An error occurred while creating your booking. Please try again.");
          });
    },

    /**
     * Cancels the booking creation from the confirmation modal.
     */
    cancelBookingCreation() {
      this.showConfirmationModal = false;
      log.debug("CreateBookingPage: Booking creation cancelled by user from confirmation modal.");
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    // ... (handleApiResponseError, handleApiCatchError, closeFailureModal as before) ...
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => e.message || e.field).join(', ');
      } else if (responseData && responseData.message) {
        errorMsg = responseData.message;
      }
      log.error("CreateBookingPage: API Response Error (handled):", errorMsg, "Full data:", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
    },
    handleApiCatchError(error, defaultMessage) {
      log.error("CreateBookingPage: API Catch Error:", error.response || error.message || error);
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
        errorMessage = "No response from server. Please check your network connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
    },
    closeFailureModal() {
      this.failModal.show = false;
    },
    /**
     * Closes the success modal and navigates the user to their "My Bookings" page.
     */
    closeModalAndRedirectToMyBookings() { // Renamed for clarity
      this.successModal.show = false;
      log.info("CreateBookingPage: Booking successful, redirecting to MyBookings page.");
      this.$router.push({ name: 'MyBookings' });
    },
    /**
     * Navigates to the previous page in the router history.
     */
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

 <style scoped>
 </style>