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

const log = console; // Assuming 'log' is intended for console logging.

/**
 * @file CreateBookingPage.vue
 * @description Allows users to create a new car booking. It can be pre-filled with a car
 * selection if a `carUuid` is passed as a route parameter. Fetches current user
 * profile and available cars. Includes validation and a confirmation step.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-05-31 (Updated)
 * @component CreateBookingPage
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
     * @type {string|null}
     * @default null
     */
    carUuid: {
      type: String,
      required: false,
      default: null,
    }
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   */
  data() {
    return {
      /** @type {Array<Object>} List of available cars for selection. */
      availableCars: [],
      /**
       * @type {Object} Holds the data for the booking request payload.
       * @property {string|null} userUuid - UUID of the user making the booking. Populated from `currentUser`.
       * @property {string} carUuid - UUID of the selected car. Bound to the car selection dropdown.
       * @property {string} bookingStartDate - ISO8601 date-time string for the booking start. Bound to datetime-local input.
       * @property {string} bookingEndDate - ISO8601 date-time string for the booking end. Bound to datetime-local input.
       * @property {string|null} driverUuid - Optional UUID of a selected driver (functionality seems commented out in template).
       */
      bookingRequest: {
        userUuid: null,
        carUuid: "",
        bookingStartDate: this.getDefaultDateTime(1, 9),
        bookingEndDate: this.getDefaultDateTime(3, 17),
        driverUuid: null,
      },
      /**
       * @type {Object} Stores details of the currently authenticated user.
       * @property {string|null} uuid - User's unique identifier.
       * @property {string} firstName - User's first name.
       * @property {string} lastName - User's last name.
       * @property {string} email - User's email address.
       */
      currentUser: {
        uuid: null,
        firstName: '',
        lastName: '',
        email: ''
      },
      /**
       * @type {Object} Controls the loading modal state.
       * @property {boolean} show - Visibility state of the loading modal.
       * @property {string} message - Message to display in the loading modal.
       */
      loadingModal: { show: false, message: "Processing..." },
      /** @type {boolean} Indicates if initial page data (user, cars) is being loaded. */
      initialDataLoading: true,
      /** @type {string} Stores client-side validation error messages to be displayed to the user. */
      validationErrorMessage: "",
      /** @type {boolean} Flag to control when to show input validation messages (e.g., after first submission attempt). */
      validationAttempted: false,
      /** @type {boolean} Controls visibility of the booking creation confirmation modal. */
      showConfirmationModal: false,
      /**
       * @type {Object} Controls the success feedback modal.
       * @property {boolean} show - Visibility state of the success modal.
       * @property {string} message - Message to display in the success modal.
       */
      successModal: { show: false, message: "" },
      /**
       * @type {Object} Controls the failure feedback modal.
       * @property {boolean} show - Visibility state of the failure modal.
       * @property {string} message - Message to display in the failure modal.
       */
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    /**
     * Computes details of the selected car based on `bookingRequest.carUuid`
     * by finding it in the `availableCars` array.
     * @returns {Object|null} The full car object if found, otherwise null.
     */
    selectedCarDetails() {
      if (!this.bookingRequest.carUuid) return null;
      return this.availableCars.find(car => car.uuid === this.bookingRequest.carUuid);
    }
  },
  /**
   * Lifecycle hook called when the component is created.
   * Initiates fetching of all initial data required for the booking form.
   */
  created() {
    log.debug("CreateBookingPage: Component created. Initial carUuid prop from route:", this.$props.carUuid);
    this.fetchAllInitialData();
  },
  methods: {
    /**
     * Formats a given date-time string into a more human-readable format.
     * Relies on `formatDateTime` from `dateUtils`.
     * @param {string} dateTimeString - The ISO date-time string to format.
     * @returns {string} Formatted date-time string (e.g., "May 31, 2025, 09:00 AM") or 'N/A' if input is invalid.
     */
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString); // from dateUtils
    },

    /**
     * Generates a default date-time string suitable for `datetime-local` input fields.
     * Defaults can be offset by days and set to a specific hour/minute.
     * Relies on `formatInputDateTime` from `dateUtils`.
     * @param {number} [addDays=0] - Number of days to add to the current date.
     * @param {number} [startHour=9] - The hour for the default time (0-23).
     * @param {number} [startMinute=0] - The minute for the default time (0-59).
     * @returns {string} Formatted date-time string in "YYYY-MM-DDTHH:mm" format.
     */
    getDefaultDateTime(addDays = 0, startHour = 9, startMinute = 0) {
      const now = new Date();
      if (addDays > 0) {
        now.setDate(now.getDate() + addDays);
      }
      now.setHours(startHour, startMinute, 0, 0);
      return formatInputDateTime(now); // from dateUtils
    },

    /**
     * Orchestrates fetching of all initial data required for the component:
     * current user profile and list of available cars.
     * Shows a loading modal during the process. Handles errors from combined promises.
     * Calls `preselectCarFromProp` after data is fetched.
     * @async
     * @returns {void}
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
            log.debug("CreateBookingPage: User profile and available cars fetched successfully.");
            this.preselectCarFromProp();
          })
          .catch(error => {
            log.error("CreateBookingPage: Error during one or more initial data fetches:", error);
            if (!this.failModal.show) {
              this.showFailureModal("Could not load all necessary data. Please try refreshing the page.");
            }
          })
          .finally(() => {
            this.loadingModal.show = false;
            this.initialDataLoading = false;
            log.debug("CreateBookingPage: Initial data fetching sequence complete.");
          });
    },

    /**
     * Fetches the profile of the currently authenticated user from the API.
     * Updates `currentUser` and `bookingRequest.userUuid` data properties.
     * Throws an error if the fetched user profile is missing a UUID.
     * @private
     * @async
     * @returns {Promise<void>} Resolves on successful fetch, otherwise throws and rejects.
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
                this.showFailureModal("User profile data is incomplete. Cannot create booking without user ID.");
                throw new Error("User profile data is incomplete (missing UUID).");
              }
              log.info("CreateBookingPage: Current user profile fetched:", this.currentUser.email);
            } else {
              this.handleApiResponseError(response.data, "Failed to load your user profile.");
              throw new Error("Failed to load user profile - unexpected API response.");
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "Failed to fetch your profile. You might need to log in again.");
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              this.$router.push({ name: 'Login' });
            }
            throw error; // Re-throw to be caught by Promise.all
          });
    },

    /**
     * Fetches the list of cars currently available for booking from the API.
     * Updates the `availableCars` data property.
     * @private
     * @async
     * @returns {Promise<void>} Resolves on successful fetch, otherwise throws and rejects.
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
              this.handleApiResponseError(response.data, "Failed to load available cars list (unexpected API response structure).");
              this.availableCars = []; // Ensure it's an array on error
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "An error occurred while fetching the list of available cars.");
            this.availableCars = [];
            throw error; // Re-throw to be caught by Promise.all
          });
    },

    /**
     * Attempts to pre-select a car in the form if a `carUuid` is provided as a prop
     * (e.g., from route parameters) and if that car exists in the fetched `availableCars` list.
     * Shows a failure modal if the pre-selected car is not found or not available.
     * @returns {void}
     */
    preselectCarFromProp() {
      const routeCarUuid = this.$props.carUuid;
      log.debug(`CreateBookingPage: Attempting to pre-select car from prop. Prop carUuid: ${routeCarUuid}`);
      if (routeCarUuid && this.availableCars.length > 0) {
        const carToSelect = this.availableCars.find(car => car.uuid === routeCarUuid);
        if (carToSelect) {
          this.bookingRequest.carUuid = routeCarUuid;
          log.info("CreateBookingPage: Car pre-selected from route parameter:", routeCarUuid);
        } else {
          log.warn(`CreateBookingPage: Car with UUID ${routeCarUuid} (from route) not found in available cars list.`);
          this.showFailureModal(`The car (ID: ${routeCarUuid.substring(0,8)}...) you previously selected is no longer available or does not exist. Please choose another car from the list.`);
        }
      } else if (routeCarUuid && !this.initialDataLoading && this.availableCars.length === 0) {
         log.warn("CreateBookingPage: carUuid prop provided, but no cars are available.");
         this.showFailureModal(`The car (ID: ${routeCarUuid.substring(0,8)}...) you selected is not available, and no other cars are available for booking at this time.`);
      } else if (routeCarUuid) {
        log.debug("CreateBookingPage: carUuid prop is present but availableCars list might be empty or still loading for pre-selection.");
      } else {
        log.debug("CreateBookingPage: No carUuid prop provided for pre-selection.");
      }
    },

    /**
     * Validates the booking form inputs. Checks for required fields (user, car, dates)
     * and logical consistency of dates (start date not in past, end date after start date, min duration).
     * Sets `validationErrorMessage` and `validationAttempted` data properties.
     * @returns {boolean} True if all validations pass, false otherwise.
     */
    validateInputs() {
      this.validationAttempted = true; // Indicate that a validation attempt has been made
      this.validationErrorMessage = ""; // Reset previous messages

      if (!this.currentUser || !this.currentUser.uuid) {
        this.validationErrorMessage = "User information is missing. Please ensure you are logged in.";
        log.warn("Validation failed: Missing current user UUID.");
        return false;
      }
      if (!this.bookingRequest.carUuid) {
        this.validationErrorMessage = "Please select a car for the booking.";
        log.warn("Validation failed: No car selected.");
        return false;
      }
      if (!this.bookingRequest.bookingStartDate) {
        this.validationErrorMessage = "Please select a booking collection date and time.";
        log.warn("Validation failed: Booking start date missing.");
        return false;
      }
      if (!this.bookingRequest.bookingEndDate) {
        this.validationErrorMessage = "Please select a booking return date and time.";
        log.warn("Validation failed: Booking end date missing.");
        return false;
      }

      const issueDateTime = new Date(this.bookingRequest.bookingStartDate);
      const returnDateTime = new Date(this.bookingRequest.bookingEndDate);
      const now = new Date();
      // Allow bookings slightly in the past to account for clock differences or immediate bookings, but not significantly.
      const fiveMinutesAgo = new Date(now.getTime() - (5 * 60 * 1000));

      if (issueDateTime < fiveMinutesAgo) {
        this.validationErrorMessage = "Collection date and time cannot be in the past.";
        log.warn(`Validation failed: Start date is in the past. Start: ${issueDateTime}, Limit: ${fiveMinutesAgo}`);
        return false;
      }
      if (returnDateTime <= issueDateTime) {
        this.validationErrorMessage = "Return date and time must be after the collection date and time.";
        log.warn(`Validation failed: End date is not after start date. Start: ${issueDateTime}, End: ${returnDateTime}`);
        return false;
      }
      const minDurationMillis = 59 * 60 * 1000; // Minimum booking duration of approx 1 hour
      if (returnDateTime.getTime() - issueDateTime.getTime() < minDurationMillis) {
        this.validationErrorMessage = "Minimum booking duration is 1 hour.";
        log.warn("Validation failed: Booking duration less than 1 hour.");
        return false;
      }
      return true;
    },

    /**
     * Initiates the booking creation process.
     * First, it validates the form inputs. If validation passes, it shows the confirmation modal.
     * If validation fails, it displays the validation error message in a failure modal.
     * @returns {void}
     */
    initiateBookingCreation() {
      log.info("CreateBookingPage: Initiate booking creation called.");
      if (!this.validateInputs()) {
        // Validation error message is set by validateInputs and shown in template,
        // additionally show it in a modal for prominence.
        this.showFailureModal(this.validationErrorMessage || "Please correct the errors in the form.");
        return;
      }
      log.debug("CreateBookingPage: Inputs validated successfully. Showing confirmation modal.");
      this.showConfirmationModal = true;
    },

    /**
     * Confirms and proceeds with creating the booking after user confirmation from the modal.
     * It hides the confirmation modal, shows a loading modal, and submits the booking payload to the API.
     * Handles success or failure of the API call by showing respective modals.
     * @async
     * @returns {void}
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
        driverUuid: this.bookingRequest.driverUuid || null,
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
     * Handles the cancellation of booking creation from the confirmation modal.
     * Hides the confirmation modal.
     * @returns {void}
     */
    cancelBookingCreation() {
      this.showConfirmationModal = false;
      log.debug("CreateBookingPage: Booking creation cancelled by user from confirmation modal.");
    },

    /**
     * Formats a booking status string (e.g., 'CONFIRMED', 'PENDING_APPROVAL')
     * into a more human-readable format (e.g., 'Confirmed', 'Pending Approval').
     * @param {string} status - The status string to format.
     * @returns {string} The formatted status string, or 'Unknown' if input is invalid.
     */
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    /**
     * Handles errors from API responses that are not caught by the `catch` block
     * (e.g., successful HTTP status but application-level error in response body).
     * Displays a failure modal with a constructed error message.
     * @param {object|null} responseData - The data part of the API response.
     * @param {string} defaultMessage - A default message to use if a specific error cannot be extracted.
     * @returns {void}
     */
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

    /**
     * Handles errors caught by the `catch` block of an API call (e.g., network errors, HTTP error statuses).
     * Displays a failure modal with a constructed error message.
     * @param {Error} error - The error object.
     * @param {string} defaultMessage - A default message to use if a specific error cannot be extracted.
     * @returns {void}
     */
    handleApiCatchError(error, defaultMessage) {
      log.error("CreateBookingPage: API Catch Error:", error.response || error.message || error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) { // Simple string error
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") { // Fallback to HTTP status text
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) { // Network error, no response received
        errorMessage = "No response from server. Please check your network connection.";
      } else if (error.message) { // Other errors (e.g., setup error)
        errorMessage = error.message;
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
    },

    /**
     * Hides the failure modal.
     * @returns {void}
     */
    closeFailureModal() {
      this.failModal.show = false;
    },

    /**
     * Closes the success modal and redirects the user to the 'MyBookings' page.
     * @returns {void}
     */
    closeModalAndRedirectToMyBookings() {
      this.successModal.show = false;
      log.info("CreateBookingPage: Booking successful, redirecting to MyBookings page.");
      this.$router.push({ name: 'MyBookings' }); // Ensure 'MyBookings' is a valid route name
    },

    /**
     * Navigates to the previous page in the router's history stack.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },

    /**
     * Helper method to show a failure modal with a specific message.
     * @param {string} message - The message to display.
     * @returns {void}
     */
    showFailureModal(message) { // Added this helper based on usage in validateInputs and preselectCarFromProp
      this.failModal.message = message;
      this.failModal.show = true;
    }
  },
};
</script>

 <style scoped>
 </style>