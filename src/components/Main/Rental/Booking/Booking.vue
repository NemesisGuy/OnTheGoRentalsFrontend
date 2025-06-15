<template>
  <div class="content-container">
    <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

    <div class="booking-form-card">
      <div class="form-header">
        <h1><i class="fas fa-calendar-plus"></i> Create Your Booking</h1>
        <p v-if="selectedCarDetails">
          You are booking the <strong>{{ selectedCarDetails.make }} {{ selectedCarDetails.model }}</strong>.
        </p>
        <p v-else>
          Select a car and your desired dates to begin.
        </p>
      </div>

      <form ref="bookingForm" @submit.prevent="initiateBookingCreation" novalidate>
        <!-- Section 1: User & Car -->
        <div class="form-section">
          <div class="form-group">
            <label for="userDisplay">Your Profile</label>
            <div class="user-display">
              <i class="fas fa-user-circle"></i>
              <span>{{ currentUser.email ? `${currentUser.firstName} ${currentUser.lastName}` : 'Loading...' }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="car">Select Your Car</label>
            <select id="car" v-model="bookingRequest.carUuid" required :disabled="initialDataLoading" :class="{ 'is-invalid': validationErrors.carUuid }">
              <option disabled value="">Please select a car</option>
              <option v-for="car in availableCars" :key="car.uuid" :value="car.uuid">
                {{ car.make }} {{ car.model }} ({{ car.year }}) - {{ car.priceGroup }}
              </option>
            </select>
            <small v-if="validationErrors.carUuid" class="form-error">{{ validationErrors.carUuid }}</small>
          </div>
        </div>

        <!-- Section 2: Dates -->
        <div class="form-section">
          <h3 class="section-title">Select Your Dates</h3>
          <div class="date-grid">
            <div class="form-group">
              <label for="bookingStartDate">Collection Date & Time</label>
              <input id="bookingStartDate" v-model="bookingRequest.bookingStartDate" type="datetime-local" required :min="minDateTime" :class="{ 'is-invalid': validationErrors.bookingStartDate }">
              <small v-if="validationErrors.bookingStartDate" class="form-error">{{ validationErrors.bookingStartDate }}</small>
            </div>
            <div class="form-group">
              <label for="bookingEndDate">Return Date & Time</label>
              <input id="bookingEndDate" v-model="bookingRequest.bookingEndDate" type="datetime-local" required :min="bookingRequest.bookingStartDate" :class="{ 'is-invalid': validationErrors.bookingEndDate }">
              <small v-if="validationErrors.bookingEndDate" class="form-error">{{ validationErrors.bookingEndDate }}</small>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="button-container">
          <button type="button" class="button back-button" @click="goBack" :disabled="loadingModal.show">
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <button class="button save-button" type="submit" :disabled="loadingModal.show || initialDataLoading">
            <i class="fas fa-check"></i> Create Booking
          </button>
        </div>
      </form>
    </div>
  </div>

  <ConfirmationModal
      key="bookingCreationConfirmationModal"
      :show="showConfirmationModal"
      title="Confirm Your Booking"
      @cancel="cancelBookingCreation"
      @confirm="confirmAndCreateBooking">
    <template #default>
      <p>Please confirm the details for your booking:</p>
      <div class="confirm-details">
        <p><strong>Car:</strong> {{ selectedCarDetails ? `${selectedCarDetails.make} ${selectedCarDetails.model}` : 'N/A' }}</p>
        <p><strong>Collection:</strong> {{ formatDateTime(bookingRequest.bookingStartDate) }}</p>
        <p><strong>Return:</strong> {{ formatDateTime(bookingRequest.bookingEndDate) }}</p>
      </div>
      <p class="text-note">This will reserve the car for the selected dates pending final confirmation.</p>
    </template>
  </ConfirmationModal>

  <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndRedirect"/>
  <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFailureModal"/>
</template>

<script>
// The <script> block is unchanged as it was already correct.
import api from "@/api";
import { formatDateTime, formatInputDateTime } from '@/utils/dateUtils';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: "CreateBookingPage",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  props: { carUuid: { type: String, required: false, default: null } },
  data() {
    return {
      availableCars: [],
      bookingRequest: {
        userUuid: null, carUuid: "",
        bookingStartDate: this.getDefaultDateTime(1, 9),
        bookingEndDate: this.getDefaultDateTime(3, 17),
      },
      currentUser: { uuid: null, firstName: '', lastName: '', email: '' },
      loadingModal: { show: false, message: "Processing..." },
      initialDataLoading: true,
      validationErrors: {},
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
    minDateTime() { return formatInputDateTime(new Date()); },
  },
  created() { this.fetchAllInitialData(); },
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
        if (userResponse.data?.data?.uuid) {
          this.currentUser = userResponse.data.data;
          this.bookingRequest.userUuid = this.currentUser.uuid;
        } else { throw new Error("User profile could not be loaded."); }
        this.availableCars = carsResponse.data.data || [];
        this.preselectCarFromProp();
      } catch (error) {
        this.handleApiCatchError(error, "Failed to load necessary data.");
        if (error.response?.status === 401) this.$router.push({ name: 'Login' });
      } finally {
        this.loadingModal.show = false;
        this.initialDataLoading = false;
      }
    },
    preselectCarFromProp() {
      if (this.$props.carUuid && this.availableCars.some(car => car.uuid === this.$props.carUuid)) {
        this.bookingRequest.carUuid = this.$props.carUuid;
      } else if (this.$props.carUuid) {
        this.showFailureModal("The selected car is no longer available. Please choose another.");
      }
    },
    validateInputs() {
      this.validationErrors = {};
      if (!this.bookingRequest.carUuid) this.validationErrors.carUuid = "Please select a car.";
      if (!this.bookingRequest.bookingStartDate) this.validationErrors.bookingStartDate = "Collection date is required.";
      if (!this.bookingRequest.bookingEndDate) this.validationErrors.bookingEndDate = "Return date is required.";
      const startDate = new Date(this.bookingRequest.bookingStartDate);
      const endDate = new Date(this.bookingRequest.bookingEndDate);
      if (startDate >= endDate) this.validationErrors.bookingEndDate = "Return date must be after the collection date.";
      if ((endDate - startDate) < (60 * 60 * 1000)) this.validationErrors.bookingEndDate = "Minimum booking duration is 1 hour.";
      return Object.keys(this.validationErrors).length === 0;
    },
    initiateBookingCreation() {
      if (!this.validateInputs()) { this.showFailureModal(Object.values(this.validationErrors)[0] || "Please correct the errors."); return; }
      this.showConfirmationModal = true;
    },
    async confirmAndCreateBooking() {
      this.showConfirmationModal = false;
      this.loadingModal = { show: true, message: "Submitting your booking..." };
      try {
        const response = await api.post("/api/v1/bookings", this.bookingRequest);
        this.successModal = { show: true, message: `Booking for ${response.data.data.car.make} created successfully!` };
      } catch (error) {
        this.handleApiCatchError(error, "An error occurred while creating your booking.");
      } finally { this.loadingModal.show = false; }
    },
    cancelBookingCreation() { this.showConfirmationModal = false; },
    handleApiCatchError(error, defaultMessage) {
      const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || error.response?.data?.message || defaultMessage;
      this.failModal = { show: true, message: errorMsg };
    },
    closeFailureModal() { this.failModal.show = false; },
    closeModalAndRedirect() {
      this.successModal.show = false;
      this.$router.push({ name: 'MyBookings' });
    },
    goBack() { this.$router.go(-1); },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
  min-height: 100%;
}

.booking-form-card {
  max-width: 800px;
  margin: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  overflow: hidden;
}

.form-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}
.form-header h1 {
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.form-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #343a40;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
}
.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.user-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
  color: #495057;
}
.user-display i {
  color: #007bff;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.is-invalid {
  border-color: #dc3545;
}
.form-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.save-button {
  background-color: #28a745;
  color: white;
}
.back-button {
  background-color: #6c757d;
  color: white;
}

.confirm-details p { margin: 0.5rem 0; }
.text-note { font-size: 0.9rem; color: #6c757d; margin-top: 1rem; }

@media (max-width: 576px) {
  .date-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>