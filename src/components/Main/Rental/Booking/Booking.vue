<template>
  <div class="card-container">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" message="Processing..."></LoadingModal>

      <form ref="bookingForm" @submit.prevent="initiateBookingCreation"> <!-- Changed to initiate a confirmation step -->
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
          /><!-- Optional: for better readonly styling -->
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
          <select id="car" v-model="selectedCarUuid" name="carUuid" class="form-select"> <!-- Changed v-model target -->
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
          </div>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body-container"> <!-- Wrapper for modals -->
    <ConfirmationModal
        key="bookingConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Booking Creation"
        @cancel="cancelBookingCreation"
        @confirm="confirmAndCreateBooking"
    >
      <!-- Content for confirmation modal passed via slot -->
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
import { formatDateTime } from "@/utils/dateUtils"; // Ensure this utility exists and works

export default {
  name: "CreateBooking", // Renamed for clarity
  components: {
    ConfirmationModal,
    SuccessModal,
    FailureModal,
    LoadingModal,
  },
  data() {
    return {
      availableCars: [], // Renamed from cars for clarity
      selectedCarUuid: "", // Will hold the UUID string of the selected car
      selectedIssuedDate: this.getDefaultDateTime(), // Initialize with default
      selectedReturnedDate: this.getDefaultDateTime(2), // Initialize with default (e.g., 2 days later)
      currentUser: { // Initialize as an object
        uuid: null,
        firstName: '',
        lastName: '',
        email: ''
      },
      loadingModal: {
        show: false,
      },
      validationErrorMessage: "", // For displaying validation errors
      showConfirmationModal: false,
      successModal: {
        show: false,
        message: "",
      },
      failModal: {
        show: false,
        message: "",
      },
      // No need for this.confirm and this.cancel as data properties for the modal
    };
  },
  computed: {
    selectedCarDetails() {
      if (!this.selectedCarUuid) return null;
      return this.availableCars.find(car => car.uuid === this.selectedCarUuid);
    }
  },
  async mounted() { // Changed to async for await
    this.loadingModal.show = true;
    await this.fetchCurrentUserProfile(); // Wait for profile to load
    await this.fetchAvailableCarsList();   // Then fetch cars
    this.preselectCarIfRouteParam();
    this.loadingModal.show = false;
  },
  methods: {
    formatDateTime, // Make utility function available in template

    getDefaultDateTime(addDays = 0) {
      const now = new Date();
      if (addDays > 0) {
        now.setDate(now.getDate() + addDays);
      }
      // Format to YYYY-MM-DDTHH:MM (required by datetime-local)
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    async fetchCurrentUserProfile() {
      // No need to get token from localStorage, api.js interceptor handles it
      try {
        const response = await api.get("/api/user/profile/read/profile"); // Endpoint from UserController
        this.currentUser = response.data; // Assuming response.data is UserResponseDTO
        if (!this.currentUser.uuid) {
          console.error("Fetched user profile does not contain UUID:", this.currentUser);
          this.failModal.message = "Failed to fetch complete user profile. Cannot create booking.";
          this.failModal.show = true;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error.response ? error.response.data : error.message);
        this.failModal.message = "Failed to fetch user profile. Please ensure you are logged in.";
        this.failModal.show = true;
        // Potentially redirect to login if profile fetch fails due to auth
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.$router.push({ name: 'Login' });
        }
      }
    },

    preselectCarIfRouteParam() {
      const routeCarUuid = this.$route.params.carUuid; // Expecting carUuid from route
      if (routeCarUuid) {
        // Check if this car is in the available list
        if (this.availableCars.some(car => car.uuid === routeCarUuid)) {
          this.selectedCarUuid = routeCarUuid;
        } else {
          console.warn(`Car with UUID ${routeCarUuid} from route param not found in available cars list.`);
          this.failModal.message = `The selected car (UUID: ${routeCarUuid}) is not available or does not exist.`;
          this.failModal.show = true;
        }
      }
    },

    async fetchAvailableCarsList() {
      // No need to get token from localStorage, api.js interceptor handles it
      try {
        // Use the corrected endpoint from your public CarController
        const response = await api.get("/api/v1/cars/available");
        this.availableCars = response.data; // Assuming response.data is List<CarResponseDTO>
      } catch (error) {
        console.error("Error fetching available cars list:", error.response ? error.response.data : error.message);
        this.failModal.message = "Failed to fetch available cars list.";
        this.failModal.show = true;
      }
    },

    validateInputs() {
      this.validationErrorMessage = ""; // Clear previous error
      if (!this.selectedIssuedDate || !this.selectedReturnedDate || !this.selectedCarUuid) {
        this.validationErrorMessage = "All fields (Collection Date, Return Date, Car) are required.";
        return false;
      }
      const issue = new Date(this.selectedIssuedDate);
      const returnD = new Date(this.selectedReturnedDate); // Renamed to avoid conflict
      const now = new Date();

      if (issue < now) {
        // Allowing a small grace period for "now" comparisons due to millisecond differences
        const gracePeriod = 5 * 60 * 1000; // 5 minutes
        if ((now.getTime() - issue.getTime()) > gracePeriod) {
          this.validationErrorMessage = "Collection date cannot be in the past.";
          return false;
        }
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
      // If inputs are valid, show confirmation modal
      this.showConfirmationModal = true;
    },

    async confirmAndCreateBooking() {
      this.showConfirmationModal = false; // Close confirmation modal
      this.loadingModal.show = true;

      // Construct the payload to EXACTLY match BookingRequestDTO on the backend
      const bookingPayload = {
        // Assuming the backend expects these fields
        userUuid: this.currentUser.uuid,
        carUuid: this.selectedCarUuid,
        bookingStartDate: this.selectedIssuedDate,
        bookingEndDate: this.selectedReturnedDate,
        // Status is set by the backend, do not send it from client for initial creation
      };
      console.log("About to send this Booking Payload:", bookingPayload);

      try {
        // Use the correct endpoint as defined in your BookingController @RequestMapping and @PostMapping
        const response = await api.post("/api/v1/bookings", bookingPayload); // Corrected endpoint

        this.loadingModal.show = false;
        console.log("Booking created successfully. Response:", response.data);
        // Assuming response.data is BookingResponseDTO
        this.successModal.message = `Booking for car ${response.data.car?.make} ${response.data.car?.model || 'Details N/A'} has been created!`;
        this.successModal.show = true;
        // Redirect or clear form after success is handled by closeAndRedirectToBookings
      } catch (error) {
        this.loadingModal.show = false;
        console.error("Booking creation API error:", error.response ? error.response.data : error.message, error);
        this.failModal.message = error.response?.data?.message || error.response?.data || "Failed to create booking. Please try again.";
        if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.includes("not available")) {
          this.failModal.message = error.response.data; // Show specific backend message if car not available
        }
        this.failModal.show = true;
      }
      // loadingModal.show = false; // Moved to try/catch to ensure it's always reset
    },

    cancelBookingCreation() {
      this.showConfirmationModal = false;
      console.log("Booking creation cancelled by user.");
    },

    closeFailureModal() {
      this.failModal.show = false;
    },
    closeAndRedirectToBookings() { // Renamed for clarity
      this.successModal.show = false;
      this.$router.push({ name: 'MyBookings' }); // Or wherever user's bookings are listed
      // No forced window.location.reload() here, let Vue Router handle navigation.
      // If Navbar needs update, it should rely on 'auth-change' event or reactive state.
    }
  },
};
</script>


