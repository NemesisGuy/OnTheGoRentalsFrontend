<template>
  <div class="card-container">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

      <form ref="bookingForm" @submit.prevent="initiateBookingCreation" novalidate>
        <div class="form-header">
          <h2><i class="fas fa-calendar-plus"></i> Create Your Booking</h2>
          <p v-if="selectedCarDetails">
            You are booking the: <strong>{{ selectedCarDetails.make }} {{ selectedCarDetails.model }}</strong>
          </p>
        </div>

        <!-- Display Logged-in User (read-only) -->
        <div class="form-group user-display">
          <label for="userDisplay">Your Profile:</label>
          <input
              id="userDisplay"
              type="text"
              :value="currentUser.email ? `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})` : 'Loading...'"
              class="form-control-plaintext user-display"
              disabled
              title="This is your user profile."

          />
        </div>

        <!-- Car Selection Dropdown -->
        <div class="form-group">
          <label for="car">Select Car:</label>
          <select id="car" v-model="bookingRequest.carUuid" class="form-select" required :disabled="initialDataLoading">
            <option disabled value="">Please select a car</option>
            <option v-for="car in availableCars" :key="car.uuid" :value="car.uuid">
              {{ car.make }} {{ car.model }} ({{ car.year }}) - {{ car.priceGroup }}
            </option>
          </select>
          <small v-if="validationErrors.carUuid" class="form-text text-danger">{{ validationErrors.carUuid }}</small>
        </div>

        <!-- Start and End Date Pickers -->
        <div class="date-group">
          <div class="form-group">
            <label for="bookingStartDate">Collection Date & Time:</label>
            <input id="bookingStartDate" v-model="bookingRequest.bookingStartDate" type="datetime-local" class="form-control" required :min="minDateTime">
            <small v-if="validationErrors.bookingStartDate" class="form-text text-danger">{{ validationErrors.bookingStartDate }}</small>
          </div>
          <div class="form-group">
            <label for="bookingEndDate">Return Date & Time:</label>
            <input id="bookingEndDate" v-model="bookingRequest.bookingEndDate" type="datetime-local" class="form-control" required :min="bookingRequest.bookingStartDate">
            <small v-if="validationErrors.bookingEndDate" class="form-text text-danger">{{ validationErrors.bookingEndDate }}</small>
          </div>
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="loadingModal.show || initialDataLoading">
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
    <!-- Confirmation Modal -->
    <ConfirmationModal
        key="bookingCreationConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Your Booking"
        @cancel="cancelBookingCreation"
        @confirm="confirmAndCreateBooking">
      <template #default>
        <p>Please confirm the details for your booking:</p><hr>
        <p><strong>Car:</strong> {{ selectedCarDetails ? `${selectedCarDetails.make} ${selectedCarDetails.model}` : 'N/A' }}</p>
        <p><strong>Collection:</strong> {{ formatDateTime(bookingRequest.bookingStartDate) }}</p>
        <p><strong>Return:</strong> {{ formatDateTime(bookingRequest.bookingEndDate) }}</p><hr>
        <p><b>Note:</b> This will reserve the car for the selected dates pending final confirmation.</p>
      </template>
    </ConfirmationModal>
    <!-- Success and Failure Modals -->
    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndRedirect"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFailureModal"/>
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

export default {
  name: "CreateBookingPage",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  props: {
    carUuid: { type: String, required: false, default: null }
  },
  data() {
    return {
      availableCars: [],
      bookingRequest: {
        userUuid: null,
        carUuid: "",
        bookingStartDate: this.getDefaultDateTime(1, 9),
        bookingEndDate: this.getDefaultDateTime(3, 17),
      },
      currentUser: { uuid: null, firstName: '', lastName: '', email: '' },
      loadingModal: { show: false, message: "Processing..." },
      initialDataLoading: true,
      validationErrors: {}, // Object to hold specific field errors
      showConfirmationModal: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    selectedCarDetails() {
      if (!this.bookingRequest.carUuid) return null;
      return this.availableCars.find(car => car.uuid === this.bookingRequest.carUuid);
    },
    minDateTime() {
      // Prevents booking in the past
      return formatInputDateTime(new Date());
    },
  },
  created() {
    this.fetchAllInitialData();
  },
  methods: {
    formatDateTime,
    getDefaultDateTime(addDays = 0, startHour = 9) {
      const date = new Date();
      date.setDate(date.getDate() + addDays);
      date.setHours(startHour, 0, 0, 0);
      return formatInputDateTime(date);
    },
    async fetchAllInitialData() {
      this.loadingModal = { show: true, message: "Loading booking information..." };
      try {
        const [userResponse, carsResponse] = await Promise.all([
          api.get("/api/v1/users/me/profile"),
          api.get("/api/v1/cars/available")
        ]);

        // Process user
        if (userResponse.data?.status === "success" && userResponse.data.data?.uuid) {
          this.currentUser = userResponse.data.data;
          this.bookingRequest.userUuid = this.currentUser.uuid;
        } else {
          throw new Error("User profile could not be loaded. Please log in again.");
        }

        // Process cars
        if (carsResponse.data?.status === "success" && Array.isArray(carsResponse.data.data)) {
          this.availableCars = carsResponse.data.data;
        }

        // Pre-select car if UUID is passed
        this.preselectCarFromProp();

      } catch (error) {
        this.handleApiCatchError(error, "Failed to load necessary data. Please try again later.");
        if (error.response?.status === 401) this.$router.push({ name: 'Login' });
      } finally {
        this.loadingModal.show = false;
        this.initialDataLoading = false;
      }
    },
    preselectCarFromProp() {
      const carUuidFromRoute = this.$props.carUuid;
      if (carUuidFromRoute && this.availableCars.length > 0) {
        const carExists = this.availableCars.some(car => car.uuid === carUuidFromRoute);
        if (carExists) {
          this.bookingRequest.carUuid = carUuidFromRoute;
        } else {
          this.showFailureModal("The selected car is no longer available. Please choose another.");
        }
      }
    },
    validateInputs() {
      this.validationErrors = {};
      if (!this.bookingRequest.carUuid) {
        this.validationErrors.carUuid = "Please select a car.";
      }
      if (!this.bookingRequest.bookingStartDate) {
        this.validationErrors.bookingStartDate = "Collection date is required.";
      }
      if (!this.bookingRequest.bookingEndDate) {
        this.validationErrors.bookingEndDate = "Return date is required.";
      }

      const startDate = new Date(this.bookingRequest.bookingStartDate);
      const endDate = new Date(this.bookingRequest.bookingEndDate);

      if (startDate >= endDate) {
        this.validationErrors.bookingEndDate = "Return date must be after the collection date.";
      }
      if ((endDate - startDate) < (60 * 60 * 1000)) { // Minimum 1 hour rental
        this.validationErrors.bookingEndDate = "Minimum booking duration is 1 hour.";
      }

      return Object.keys(this.validationErrors).length === 0;
    },
    initiateBookingCreation() {
      if (!this.validateInputs()) {
        const firstError = Object.values(this.validationErrors)[0];
        this.showFailureModal(firstError || "Please correct the errors before proceeding.");
        return;
      }
      this.showConfirmationModal = true;
    },
    async confirmAndCreateBooking() {
      this.showConfirmationModal = false;
      this.loadingModal = { show: true, message: "Submitting your booking..." };

      const payload = {
        userUuid: this.bookingRequest.userUuid,
        carUuid: this.bookingRequest.carUuid,
        bookingStartDate: this.bookingRequest.bookingStartDate,
        bookingEndDate: this.bookingRequest.bookingEndDate,
      };

      try {
        const response = await api.post("/api/v1/bookings", payload);
        const newBooking = response.data.data;
        this.successModal = { show: true, message: `Booking for ${newBooking.car.make} has been successfully created!` };
      } catch (error) {
        this.handleApiCatchError(error, "An error occurred while creating your booking.");
      } finally {
        this.loadingModal.show = false;
      }
    },
    cancelBookingCreation() {
      this.showConfirmationModal = false;
    },
    handleApiCatchError(error, defaultMessage) {
      const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || error.response?.data?.message || defaultMessage;
      this.failModal = { show: true, message: errorMsg };
    },
    closeFailureModal() {
      this.failModal.show = false;
    },
    closeModalAndRedirect() {
      this.successModal.show = false;
      this.$router.push({ name: 'MyBookings' });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

.date-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.date-group .form-group {
  flex: 1 1 200px; /* Allow wrapping on smaller screens */
}
.form-control-plaintext {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  color: var(--color-text-black);
}
.user-display{
    color: var(--color-text-black);
}
</style>