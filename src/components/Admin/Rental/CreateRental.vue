<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

      <form v-if="!loadingModal.show && !errorMessage" ref="rentalForm" @submit.prevent="triggerConfirmation">
        <div class="form-header">
          <h2><i class="fas fa-file-signature"></i> Create Rental from Booking</h2>
          <p v-if="bookingDetails.uuid">Converting Booking: {{ bookingDetails.uuid?.substring(0,8) }}...</p>
        </div>

        <div class="display-section">
          <p><strong>Customer:</strong> {{ bookingDetails.user?.firstName }} {{ bookingDetails.user?.lastName }}</p>
          <p><strong>Car:</strong> {{ bookingDetails.car?.make }} {{ bookingDetails.car?.model }}</p>
          <p><strong>Original Booking Return:</strong> {{ formatDateTime(bookingDetails.bookingEndDate) }}</p>
        </div>
        <hr>

        <div class="form-group">
          <label for="issuer">Issuing Staff Member:</label>
          <select id="issuer" v-model="rentalData.issuerId" required>
            <option :value="null" disabled>-- Select Staff --</option>
            <option v-if="currentStaffUser" :value="currentStaffUser.uuid">Me: {{ currentStaffUser.firstName }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="driver">Assign Driver (Optional):</label>
          <select id="driver" v-model="rentalData.driverUuid">
            <option :value="null">-- No Driver --</option>
            <option v-for="driver in availableDrivers" :key="driver.uuid" :value="driver.uuid">
              {{ driver.firstName }} {{ driver.lastName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="actualPickupTime">Actual Pickup Time:</label>
          <input id="actualPickupTime" v-model="rentalData.actualPickupTime" type="datetime-local" required>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="isSubmitting">
            <i class="fas fa-check"></i> {{ isSubmitting ? 'Creating...' : 'Create Rental' }}
          </button>
          <button type="button" class="back-button button" @click="goBack" :disabled="isSubmitting">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>

      <div v-if="errorMessage && !loadingModal.show" class="error-container">
        <p>{{ errorMessage }}</p>
        <button class="button back-button" @click="goBack">Go Back</button>
      </div>
    </div>

    <ConfirmationModal :show="showConfirmationModal" title="Confirm Rental Creation" @cancel="cancelCreation" @confirm="executeCreateRental">
      <template #default>
        <div>
          <p>This will create a new rental and update the original booking.</p><hr>
          <p><strong>Customer:</strong> {{ bookingDetails.user?.firstName }} {{ bookingDetails.user?.lastName }}</p>
          <p><strong>Car:</strong> {{ bookingDetails.car?.make }} {{ bookingDetails.car?.model }}</p>
          <p><strong>Pickup Time:</strong> {{ formatDateTime(rentalData.actualPickupTime) }}</p>
        </div>
      </template>
    </ConfirmationModal>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndGoBack" @ok="closeModalAndGoBack"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeModal"/>
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime, formatInputDateTime } from '@/utils/dateUtils';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: "AdminCreateRentalFromBooking",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  props: {
    uuid: { type: String, required: true }
  },
  data() {
    return {
      bookingDetails: {},
      // Data object matches the simple RentalFromBookingRequestDTO
      rentalData: {
        issuerId: null,
        driverUuid: null,
        actualPickupTime: formatInputDateTime(new Date()),
      },
      availableDrivers: [],
      currentStaffUser: null,
      loadingModal: { show: false, message: "Loading..." },
      isSubmitting: false,
      errorMessage: '',
      showConfirmationModal: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" }
    };
  },
  async created() {
    await this.fetchInitialData();
  },
  methods: {
    formatDateTime,
    async fetchInitialData() {
      this.loadingModal = { show: true, message: "Loading booking and user data..." };
      try {
        const [staffProfileResponse, driversResponse, bookingResponse] = await Promise.all([
          api.get('/api/v1/users/me/profile'),
          api.get('/api/v1/admin/drivers'),
          api.get(`/api/v1/admin/bookings/${this.uuid}`)
        ]);

        this.currentStaffUser = staffProfileResponse.data.data;
        this.rentalData.issuerId = this.currentStaffUser?.uuid;

        this.availableDrivers = driversResponse.data.data || [];
        this.bookingDetails = bookingResponse.data.data;

        this.rentalData.driverUuid = this.bookingDetails.driver?.uuid || null;

      } catch (error) {
        this.errorMessage = "Failed to load initial data: " + (error.response?.data?.message || error.message);
        this.failModal.message = this.errorMessage;
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    triggerConfirmation() {
      if (!this.rentalData.issuerId || !this.rentalData.actualPickupTime) {
        this.failModal = { show: true, message: "Please select an issuing staff member and confirm the pickup time." };
        return;
      }
      this.showConfirmationModal = true;
    },
    cancelCreation() {
      this.showConfirmationModal = false;
    },
    async executeCreateRental() {
      this.showConfirmationModal = false;
      this.isSubmitting = true;
      this.loadingModal = { show: true, message: "Converting booking to rental..." };

      // Payload now correctly matches the simple RentalFromBookingRequestDTO
      const payload = { ...this.rentalData };

      try {
        // **THE FIX**: Call the single, correct, transactional endpoint.
        // It should be `/api/v1/admin/rentals/from-booking/{uuid}` as we designed.
        const response = await api.post(`/api/v1/rentals/from-booking/${this.uuid}`, payload);

        this.successModal.message = `Rental created and booking updated successfully! New Rental UUID: ${response.data.data.uuid?.substring(0,8)}...`;
        this.successModal.show = true;

      } catch (error) {
        const apiErrors = error.response?.data?.errors;
        this.failModal.message = apiErrors ? apiErrors.map(e => e.message).join('; ') : (error.response?.data?.message || "An error occurred during conversion.");
        this.failModal.show = true;
      } finally {
        this.isSubmitting = false;
        this.loadingModal.show = false;
      }
    },
    closeModal() {
      this.failModal.show = false;
    },
    closeModalAndGoBack() {
      this.successModal.show = false;
      this.$router.push({ name: 'StaffDailyOperations' });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.display-section { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
.display-section p { margin: 8px 0; font-size: 1rem; }
.display-section strong { color: #495057; }
.error-message, .error-container { color: #dc3545; font-weight: bold; text-align: center; margin: 15px 0; }
</style>