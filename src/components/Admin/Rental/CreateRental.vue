<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

      <form ref="rentalForm" @submit.prevent="triggerConfirmation">
        <div class="form-header">
          <h2><i class="fas fa-file-signature"></i> Create Rental from Booking</h2>
          <p v-if="bookingDetails.uuid">Converting Booking: {{ bookingDetails.uuid?.substring(0,8) }}...</p>
        </div>

        <div class="form-group">
          <label for="userDisplay">Customer:</label>
          <input id="userDisplay" :value="selectedUserName" type="text" disabled>
        </div>
        <div class="form-group">
          <label for="carDisplay">Car:</label>
          <input id="carDisplay" :value="selectedCarName" type="text" disabled>
        </div>
        <div class="form-group">
          <label for="expectedReturnDate">Expected Return Date & Time:</label>
          <input id="expectedReturnDate" v-model="rental.expectedReturnDate" type="datetime-local" required>
        </div>
        <hr>

        <div class="form-group">
          <label for="issuer">Issuing Staff Member:</label>
          <select id="issuer" v-model="rental.issuer" required>
            <option :value="null" disabled>-- Select Staff --</option>
            <option v-if="currentStaffUser" :value="currentStaffUser.uuid">Me: {{ currentStaffUser.firstName }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="driver">Assign Driver (Optional):</label>
          <select id="driver" v-model="rental.driverUuid">
            <option :value="null">-- No Driver --</option>
            <option v-for="driver in availableDrivers" :key="driver.uuid" :value="driver.uuid">
              {{ driver.firstName }} {{ driver.lastName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="issuedDate">Issued Date & Time (Pickup):</label>
          <input id="issuedDate" v-model="rental.issuedDate" type="datetime-local" required>
        </div>
        <div class="form-group">
          <label for="fine">Initial Fine (if any):</label>
          <input id="fine" v-model.number="rental.fine" type="number" step="0.01" min="0">
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
    </div>

    <ConfirmationModal :show="showConfirmationModal" title="Confirm Rental Creation" @cancel="cancelCreation" @confirm="executeCreateRental">
      <template #default>
        <div>
          <p>This will create a new rental record and update the original booking.</p><hr>
          <p><strong>Customer:</strong> {{ selectedUserName }}</p>
          <p><strong>Car:</strong> {{ selectedCarName }}</p>
          <p><strong>Pickup Time:</strong> {{ formatDateTime(rental.issuedDate) }}</p>
          <p><strong>Return Due:</strong> {{ formatDateTime(rental.expectedReturnDate) }}</p>
        </div>
      </template>
    </ConfirmationModal>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndGoBack" @ok="closeModalAndGoBack"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeModal"/>
  </div>
</template>

<script>
import api from "@/api";
// *** THE FIX IS HERE: Correctly importing the utility functions ***
import { formatDateTime, formatInputDateTime } from '@/utils/dateUtils';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: "AdminCreateRentalFromBooking",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  props: {
    bookingUuid: { type: String, required: true }
  },
  data() {
    return {
      bookingDetails: {},
      rental: {
        userUuid: null,
        carUuid: null,
        driverUuid: null,
        issuer: null,
        receiver: null,
        fine: 0.0,
        issuedDate: formatInputDateTime(new Date()),
        expectedReturnDate: '',
        returnedDate: null,
        status: 'ACTIVE',
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
  computed: {
    selectedUserName() {
      return this.bookingDetails.user ? `${this.bookingDetails.user.firstName} ${this.bookingDetails.user.lastName}` : 'N/A';
    },
    selectedCarName() {
      return this.bookingDetails.car ? `${this.bookingDetails.car.make} ${this.bookingDetails.car.model}` : 'N/A';
    },
  },
  async created() {
    await this.fetchInitialData();
  },
  methods: {
    // *** THE FIX IS HERE: Directly using the imported function in the template ***
    // This makes the `formatDisplayDateTime` method unnecessary in this component.
    // We can call `formatDateTime()` directly in the template.
    formatDateTime, // Exposing the function to the template

    async fetchInitialData() {
      this.loadingModal = { show: true, message: "Loading booking and user data..." };
      try {
        const [staffProfileResponse, driversResponse, bookingResponse] = await Promise.all([
          api.get('/api/v1/users/me/profile'),
          api.get('/api/v1/admin/drivers'),
          api.get(`/api/v1/admin/bookings/${this.bookingUuid}`)
        ]);

        this.currentStaffUser = staffProfileResponse.data.data;
        this.rental.issuer = this.currentStaffUser?.uuid;

        this.availableDrivers = driversResponse.data.data || [];
        this.bookingDetails = bookingResponse.data.data;

        this.rental.userUuid = this.bookingDetails.user?.uuid;
        this.rental.carUuid = this.bookingDetails.car?.uuid;
        this.rental.driverUuid = this.bookingDetails.driver?.uuid || null;
        this.rental.expectedReturnDate = this.bookingDetails.bookingEndDate ? formatInputDateTime(this.bookingDetails.bookingEndDate) : '';

      } catch (error) {
        this.failModal.message = "Failed to load initial data: " + (error.response?.data?.errors?.[0]?.message || error.message);
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    triggerConfirmation() {
      if (!this.rental.userUuid || !this.rental.carUuid || !this.rental.issuer) {
        this.failModal.message = "Required fields are missing. Cannot create rental.";
        this.failModal.show = true;
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
      this.loadingModal = { show: true, message: "Creating rental and updating booking..." };

      const payload = { ...this.rental };

      try {
        await api.post('/api/v1/admin/rentals', payload);

        const newBookingStatus = 'RENTAL_INITIATED';
        await api.put(`/api/v1/admin/bookings/${this.bookingUuid}/update-status`, { status: newBookingStatus });

        this.successModal.message = `Rental created and booking updated successfully!`;
        this.successModal.show = true;

      } catch (error) {
        const apiErrors = error.response?.data?.errors;
        this.failModal.message = apiErrors ? apiErrors.map(e => e.message).join(', ') : (error.response?.data?.message || "An error occurred during the process.");
        this.failModal.show = true;
      } finally {
        this.isSubmitting = false;
        this.loadingModal.show = false;
      }
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    closeModalAndGoBack() {
      this.closeModal();
      this.$router.push({ name: 'StaffDailyOperations' });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.form-group input[disabled] { background-color: #e9ecef; opacity: 0.9; cursor: not-allowed; color: #495057; font-weight: 500; }
.error-message { color: #dc3545; margin-bottom: 15px; font-weight: bold; text-align: center; }
</style>