<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

      <div v-if="!loadingModal.show && error" class="error-container">
        <p>{{ error }}</p>
        <button class="button back-button" @click="goBack">Go Back</button>
      </div>

      <form v-if="!loadingModal.show && !error && rental" ref="returnForm" @submit.prevent="triggerConfirmation">
        <div class="form-header">
          <h2><i class="fas fa-undo-alt"></i> Process Rental Return</h2>
          <p>Processing return for Rental: {{ rental.uuid ? rental.uuid.substring(0,8) : 'N/A' }}...</p>
        </div>

        <div class="display-section">
          <p><strong>Customer:</strong> {{ rental.user?.firstName }} {{ rental.user?.lastName }}</p>
          <p><strong>Car:</strong> {{ rental.car?.make }} {{ rental.car?.model }} ({{ rental.car?.licensePlate }})</p>
          <p><strong>Rental Started:</strong> {{ formatInputDateTime(rental.issuedDate) }}</p>
          <!-- Displaying the issuer's name for clarity -->
          <p><strong>Original Issuer:</strong> {{ rental.issuer?.firstName || 'N/A' }}</p>
        </div>
        <hr>

        <div class="form-group">
          <label for="returnDate">Actual Return Date & Time:</label>
          <input id="returnDate" v-model="updateData.returnedDate" type="datetime-local" required>
        </div>

        <div class="form-group">
          <label for="receiver">Receiving Staff Member:</label>
          <select id="receiver" v-model="updateData.receiver" required>
            <option :value="null" disabled>-- Select Staff --</option>
            <option v-if="currentStaffUser" :value="currentStaffUser.uuid">Me: {{ currentStaffUser.firstName }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="fineAmount">Additional Fines (if any):</label>
          <input id="fineAmount" v-model.number="updateData.fine" type="number" step="0.01" min="0" placeholder="e.g., for lateness, damages">
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="isSubmitting">
            <i class="fas fa-check-circle"></i> {{ isSubmitting ? 'Processing...' : 'Complete Return' }}
          </button>
          <button type="button" class="back-button button" @click="goBack" :disabled="isSubmitting">
            <i class="fas fa-arrow-left"></i> Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Modals are unchanged -->
    <ConfirmationModal
        key="returnConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Rental Return" @cancel="cancelConfirmation" @confirm="executeProcessReturn">
      <template #default>
        <div>
          <p>Please confirm the details for this return:</p><hr>
          <p><strong>Returning Car:</strong> {{ rental.car?.make }} {{ rental.car?.model }}</p>
          <p><strong>Return Time:</strong> {{ formatInputDateTime(updateData.returnedDate) }}</p>
          <p><strong>Additional Fines:</strong> R{{ (updateData.fine || 0).toFixed(2) }}</p><hr>
          <p>Finalizing this return will mark the rental as <strong>COMPLETED</strong>. Proceed?</p>
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
  name: "ProcessReturn",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      rental: null,
      updateData: {
        receiver: null,
        fine: 0.0,
        returnedDate: formatInputDateTime(new Date()),
      },
      currentStaffUser: null,
      loadingModal: { show: true, message: "Loading rental details..." },
      error: null,
      isSubmitting: false,
      errorMessage: '',
      showConfirmationModal: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" }
    };
  },
  created() {
    this.fetchInitialData();
  },
  methods: {
    formatInputDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A';
      return formatDateTime(dateTimeString);
    },
    async fetchInitialData() {
      // Corrected to use rentalUuid from route params, as defined in previous steps
      const rentalUuid = this.$route.params.uuid;
      if (!rentalUuid) {
        this.error = "No rental specified for return.";
        this.loadingModal.show = false;
        return;
      }
      try {
        const [rentalResponse, userProfileResponse] = await Promise.all([
          api.get(`/api/v1/admin/rentals/${rentalUuid}`),
          api.get('/api/v1/users/me/profile')
        ]);

        if (rentalResponse.data?.status === 'success' && rentalResponse.data.data) {
          this.rental = rentalResponse.data.data;
        } else {
          throw new Error("Rental not found.");
        }

        if (userProfileResponse.data?.status === 'success' && userProfileResponse.data.data) {
          this.currentStaffUser = userProfileResponse.data.data;
          this.updateData.receiver = this.currentStaffUser.uuid;
        } else {
          throw new Error("Could not identify current staff member.");
        }

      } catch (err) {
        this.error = err.response?.data?.message || err.message || "Failed to load initial data.";
      } finally {
        this.loadingModal.show = false;
      }
    },
    triggerConfirmation() {
      if (!this.updateData.returnedDate || !this.updateData.receiver) {
        this.failModal = { show: true, message: "Please ensure all required fields are filled." };
        return;
      }
      this.showConfirmationModal = true;
    },
    cancelConfirmation() {
      this.showConfirmationModal = false;
    },
    async executeProcessReturn() {
      this.showConfirmationModal = false;
      this.isSubmitting = true;
      this.loadingModal = { show: true, message: "Processing return..." };

      // **THE DEFINITIVE FIX IS HERE**
      // We will defensively check the structure of `this.rental.issuer`
      // before trying to access its `uuid` property.
      let issuerUuid = null;
      if (this.rental && this.rental.issuer) {
        // Check if issuer is an object with a uuid, otherwise assume it's the uuid string itself.
        issuerUuid = typeof this.rental.issuer === 'object'
            ? this.rental.issuer.uuid
            : this.rental.issuer;
      }

      if (!issuerUuid) {
        this.failModal = { show: true, message: "Critical Error: Original issuer ID could not be determined. Cannot proceed." };
        this.isSubmitting = false;
        this.loadingModal.show = false;
        return;
      }

      const payload = {
        // Pass original, unchanged data to satisfy backend validation
        userUuid: this.rental.user.uuid,
        carUuid: this.rental.car.uuid,
        driverUuid: this.rental.driver?.uuid || null,
        issuer: issuerUuid, // <-- Using the failsafe variable
        issuedDate: this.rental.issuedDate,

        // Pass updated data from the form
        receiver: this.updateData.receiver,
        returnedDate: this.updateData.returnedDate,
        expectedReturnDate: this.updateData.returnedDate, // To satisfy @FutureOrPresent
        fine: this.updateData.fine || 0.0,
        status: 'COMPLETED',
      };

      console.log("Submitting final payload:", payload);

      try {
        const rentalUuid = this.rental.uuid;
        await api.put(`/api/v1/admin/rentals/${rentalUuid}`, payload);
        this.successModal = { show: true, message: "Rental return processed successfully!" };
      } catch (error) {
        console.error("Error processing return:", error.response?.data || error);
        this.failModal.message = error.response?.data?.errors?.map(e => `${e.field}: ${e.message}`).join('; ') || "Failed to process the return.";
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
.display-section { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
.display-section p { margin: 8px 0; font-size: 1rem; }
.display-section strong { color: #495057; }
hr { margin: 25px 0; border-top: 1px solid #e9ecef; }
.error-container { text-align: center; padding: 40px; font-size: 1.2rem; color: #721c24; }
</style>