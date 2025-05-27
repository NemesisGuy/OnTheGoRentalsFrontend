<template>
  <div class="card-container">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" message="Processing..."></LoadingModal>

      <form ref="bookingForm" @submit.prevent="initiateBookingCreation">
        <div class="form-header">
          <h2>Create Booking</h2>
        </div>

        <div class="form-group">
          <label for="userDisplay">User:</label>
          <input
              id="userDisplay"
              type="text"
              :value="currentUser && currentUser.email ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})` : 'Loading user...'"
              readonly
              class="form-control-plaintext"
          />
        </div>

        <div class="form-group">
          <label for="issuedDate">Rental Collection Date:</label>
          <input id="issuedDate" v-model="selectedIssuedDate" name="issuedDate" type="datetime-local" class="form-control">
        </div>

        <div class="form-group">
          <label for="returnedDate">Rental Return Date:</label>
          <input id="returnedDate" v-model="selectedReturnedDate" name="returnedDate" type="datetime-local" class="form-control">
        </div>

        <div class="form-group">
          <label for="car">Select Car:</label>
          <select id="car" v-model="selectedCarUuid" name="carUuid" class="form-select">
            <option disabled value="">Please select a car</option>
            <option v-for="car in availableCars" :key="car.uuid" :value="car.uuid">
              {{ car.make }} {{ car.model }} ({{ car.year }}) - {{ car.priceGroup }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <div class="button-container">
            <button class="confirm-button button" type="submit" :disabled="loadingModal.show || !currentUser.uuid || !selectedCarUuid">
              <i class="fas fa-check"></i> Create Booking
            </button>
            <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
          </div>
        </div>
      </form>

    </div>
  </div>

  <div class="modal-body-container">
    <ConfirmationModal
        key="bookingConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Booking Creation"
        @cancel="cancelBookingCreation"
        @confirm="confirmAndCreateBooking"
    >
      <template #default>
        <p>Are you sure you want to create this booking with the following details?</p>
        <hr>
        <p><strong>User:</strong> {{ currentUser && currentUser.email ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})` : '' }}</p>
        <p><strong>Car:</strong> {{ selectedCarDetails ? `${selectedCarDetails.make} ${selectedCarDetails.model} (${selectedCarDetails.year})` : 'N/A' }}</p>
        <p><strong>Collection Date:</strong> {{ formatDateTime(selectedIssuedDate) }}</p>
        <p><strong>Return Date:</strong> {{ formatDateTime(selectedReturnedDate) }}</p>
        <hr>
        <p><b>Warning:</b> This action will proceed to book the car.</p>
      </template>
    </ConfirmationModal>

    <SuccessModal
        key="bookingSuccessModal"
        :message="successModal.message"
        :show="successModal.show"
        @ok="closeAndRedirectToBookings"
        @close="closeAndRedirectToBookings"
    ></SuccessModal>

    <FailureModal
        key="bookingFailureModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailureModal"
    ></FailureModal>
  </div>
</template>

<script>
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils";

export default {
  name: "CreateBooking",
  components: {
    ConfirmationModal,
    SuccessModal,
    FailureModal,
    LoadingModal,
  },
  data() {
    return {
      availableCars: [],
      selectedCarUuid: "",
      selectedIssuedDate: this.getDefaultDateTime(),
      selectedReturnedDate: this.getDefaultDateTime(2),
      currentUser: {
        uuid: null,
        firstName: '',
        lastName: '',
        email: ''
      },
      loadingModal: {
        show: false, // This controls the <LoadingModal> component passed as prop
      },
      initialDataLoading: true, // Separate flag for initial page load shimmer/blocker
      validationErrorMessage: "",
      showConfirmationModal: false,
      successModal: {
        show: false,
        message: "",
      },
      failModal: {
        show: false,
        message: "",
      },
    };
  },
  computed: {
    selectedCarDetails() {
      if (!this.selectedCarUuid) return null;
      return this.availableCars.find(car => car.uuid === this.selectedCarUuid);
    }
  },
  async mounted() {
    this.initialDataLoading = true; // For overall page loading state if needed beyond shimmer
    this.loadingModal.show = true; // Show loading modal during initial fetches
    await this.fetchCurrentUserProfile();
    await this.fetchAvailableCarsList();
    this.preselectCarIfRouteParam();
    this.loadingModal.show = false;
    this.initialDataLoading = false;
  },
  methods: {
    formatDateTime,

    getDefaultDateTime(addDays = 0) {
      const now = new Date();
      if (addDays > 0) {
        now.setDate(now.getDate() + addDays);
      }
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    async fetchCurrentUserProfile() {
      try {
        const response = await api.get("/api/v1/users/me/profile");
        if (response.data && response.data.status === "success" && response.data.data) {
          this.currentUser = response.data.data;
          if (!this.currentUser.uuid) {
            console.error("Fetched user profile does not contain UUID:", this.currentUser);
            this.failModal.message = "Failed to fetch complete user profile. Cannot create booking.";
            this.failModal.show = true;
          }
        } else {
          this.handleApiResponseError(response.data, "Failed to load user profile data.");
        }
      } catch (error) {
        this.handleApiCatchError(error, "Failed to fetch user profile. Please ensure you are logged in.");
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.$router.push({ name: 'Login' });
        }
      }
    },

    preselectCarIfRouteParam() {
      const routeCarUuid = this.$route.params.carUuid;
      if (routeCarUuid) {
        if (this.availableCars && this.availableCars.length > 0) {
          const carExists = this.availableCars.some(car => car.uuid === routeCarUuid);
          if (carExists) {
            this.selectedCarUuid = routeCarUuid;
          } else {
            console.warn(`Car with UUID ${routeCarUuid} from route param not found in available cars. List:`, this.availableCars);
            this.failModal.message = `The car selected from the previous page (UUID: ${routeCarUuid}) is not available or does not exist. Please select another.`;
            this.failModal.show = true;
          }
        } else {
          console.warn("Available cars list is empty, cannot pre-select car from route param yet.");
          // This might happen if car list fetch fails or is slow. User will have to select manually.
        }
      }
    },

    async fetchAvailableCarsList() {
      try {
        const response = await api.get("/api/v1/cars/available"); // Path from CarController
        if (response.data && response.data.status === "success" && response.data.data) {
          this.availableCars = response.data.data; // <<<< CORRECTLY ACCESS NESTED data
          console.log("Booking.vue: Fetched available cars:", this.availableCars);
        } else if (response.data && response.data.status === "success" && response.data.data === null) {
          this.availableCars = []; // No available cars, still a success response
          console.log("Booking.vue: No available cars found.");
        } else {
          this.handleApiResponseError(response.data, "Failed to load available cars list.");
          this.availableCars = []; // Ensure it's an array on failure
        }
      } catch (error) {
        this.handleApiCatchError(error, "Failed to fetch available cars list.");
        this.availableCars = []; // Ensure it's an array on catch
      }
    },

    validateInputs() {
      this.validationErrorMessage = "";
      if (!this.selectedIssuedDate || !this.selectedReturnedDate || !this.selectedCarUuid) {
        this.validationErrorMessage = "Collection Date, Return Date, and Car selection are required.";
        return false;
      }
      if (!this.currentUser || !this.currentUser.uuid) {
        this.validationErrorMessage = "User information is missing. Please try logging in again.";
        return false;
      }
      const issue = new Date(this.selectedIssuedDate);
      const returnD = new Date(this.selectedReturnedDate);
      const now = new Date();
      const gracePeriod = 5 * 60 * 1000; // 5 minutes grace for "now"
      if (issue.getTime() < (now.getTime() - gracePeriod)) {
        this.validationErrorMessage = "Collection date cannot be in the past.";
        return false;
      }
      if (returnD <= issue) {
        this.validationErrorMessage = "Return date must be after the collection date.";
        return false;
      }
      return true;
    },

    initiateBookingCreation() {
      if (!this.validateInputs()) {
        this.failModal.message = this.validationErrorMessage;
        this.failModal.show = true;
        return;
      }
      this.showConfirmationModal = true;
    },

    async confirmAndCreateBooking() {
      this.showConfirmationModal = false;
      this.loadingModal.show = true;

      const bookingPayload = {
        userUuid: this.currentUser.uuid,
        carUuid: this.selectedCarUuid,
        bookingStartDate: this.selectedIssuedDate,
        bookingEndDate: this.selectedReturnedDate,
      };
      console.log("About to send this Booking Payload:", bookingPayload);

      try {
        const response = await api.post("/api/v1/bookings", bookingPayload); // Path from BookingController

        this.loadingModal.show = false;
        if (response.data && response.data.status === "success" && response.data.data) {
          const createdBooking = response.data.data; // This is BookingResponseDTO
          console.log("Booking created successfully. Response DTO:", createdBooking);
          this.successModal.message = `Booking for car ${createdBooking.car?.make || ''} ${createdBooking.car?.model || 'Details N/A'} has been created!`;
          this.successModal.show = true;
        } else {
          this.handleApiResponseError(response.data, "Failed to create booking: Unexpected server response.");
        }
      } catch (error) {
        this.loadingModal.show = false;
        this.handleApiCatchError(error, "Failed to create booking. Please try again.");
      }
    },

    cancelBookingCreation() {
      this.showConfirmationModal = false;
      console.log("Booking creation cancelled by user.");
    },

    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => e.message || e.field).join(', ');
      } else if (responseData && responseData.message) { // If your error ApiResponse has a single message
        errorMsg = responseData.message;
      }
      console.error("API Response Error:", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
    },

    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error:", error.response ? error.response.data : error.message, error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data; // This should be your ApiResponse
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) { // Avoid huge HTML error pages
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your network connection.";
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
    },

    closeFailureModal() {
      this.failModal.show = false;
    },
    closeAndRedirectToBookings() {
      this.successModal.show = false;
      this.$router.push({ name: 'MyBookings' });
    },
    goBack() {
      this.$router.go(-1); // Go back to the previous page
    },
  },
};
</script>

<style scoped>
/* Basic styling, adapt as needed */

</style>