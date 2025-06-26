<template>
  <div class="content-container">
    <div class="page-header">
      <h1><i class="fas fa-undo-alt"></i> Process Rental Return</h1>
    </div>

    <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

    <div v-if="!loadingModal.show && error" class="error-container">
      <p><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
      <button class="button back-button" @click="goBack">Go Back</button>
    </div>

    <form v-if="!loadingModal.show && !error && rental" class="return-form-card" @submit.prevent="triggerConfirmation">
      <!-- Form Header -->
      <div class="form-header">
        <h2>Return Details</h2>
        <p class="sub-header">Finalizing return for rental: {{ rental.uuid ? rental.uuid.substring(0,8) : 'N/A' }}...</p>
      </div>

      <!-- Summary Section -->
      <div class="summary-section">
        <div class="summary-item">
          <label>Customer</label>
          <span>{{ rental.user?.firstName }} {{ rental.user?.lastName }}</span>
        </div>
        <div class="summary-item">
          <label>Car</label>
          <span>{{ rental.car?.make }} {{ rental.car?.model }} ({{ rental.car?.licensePlate }})</span>
        </div>
        <div class="summary-item">
          <label>Rental Started</label>
          <span>{{ formatDateTime(rental.issuedDate) }}</span>
        </div>
      </div>

      <!-- Input Section -->
      <div class="form-body">
        <div class="form-group">
          <label for="returnDate">Actual Return Date & Time</label>
          <input id="returnDate" v-model="updateData.returnedDate" type="datetime-local" required>
        </div>

        <div class="form-group">
          <label for="receiver">Receiving Staff Member</label>
          <select id="receiver" v-model="updateData.receiver" required>
            <option :value="null" disabled>-- Select Staff --</option>
            <option v-if="currentStaffUser" :value="currentStaffUser.uuid">Me: {{ currentStaffUser.firstName }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="fineAmount">Additional Fines (if any)</label>
          <div class="input-with-currency">
            <span>R</span>
            <input id="fineAmount" v-model.number="updateData.fine" type="number" step="0.01" min="0" placeholder="0.00">
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button type="button" class="button back-button" @click="goBack" :disabled="isSubmitting">
          <i class="fas fa-arrow-left"></i> Cancel
        </button>
        <button class="button process-button" type="submit" :disabled="isSubmitting">
          <i class="fas fa-check-circle"></i> {{ isSubmitting ? 'Processing...' : 'Complete Return' }}
        </button>
      </div>
    </form>

    <ConfirmationModal
        key="returnConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Rental Return" @cancel="cancelConfirmation" @confirm="executeProcessReturn">
      <template #default>
        <div class="confirmation-content">
          <p>Please confirm the details for this return:</p>
          <div class="confirm-details">
            <p><strong>Car:</strong> {{ rental.car?.make }} {{ rental.car?.model }}</p>
            <p><strong>Return Time:</strong> {{ formatDateTime(updateData.returnedDate) }}</p>
            <p><strong>Additional Fines:</strong> R{{ (updateData.fine || 0).toFixed(2) }}</p>
          </div>
          <p class="confirm-note">This action is irreversible and will mark the rental as <strong>COMPLETED</strong>.</p>
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
    formatDateTime,
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
      console.log("Original rental issuer data:", this.rental.issuer);
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
        issuer: this.rental.issuer, // <-- Using the failsafe variable
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

.content-container {
  padding: 2rem;
  background-color: var(--ui-background);
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.return-form-card {
  max-width: 700px;
  margin: auto;
  background: var(--ui-surface);
  border-radius: 16px;
  box-shadow: 0 8px 40px var(--ui-shadow);
  overflow: hidden;
}

.form-header {
  text-align: center;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid var(--ui-border);
}
.form-header h2 { margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.75rem;}
.form-header .sub-header { color: var(--text-secondary); margin: 0.25rem 0 0; font-family: 'Courier New', monospace; }

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid var(--ui-border);
}
.summary-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}
.summary-item span {
  display: block;
  font-size: 1rem;
  color: var(--text-primary);
}

.form-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  font-size: 1rem;
}
.input-with-currency {
  position: relative;
}
.input-with-currency span {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-weight: 600;
}
.input-with-currency input {
  padding-left: 35px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid var(--ui-border);
}

.button {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.back-button {
  background-color: var(--text-secondary);
  color: var(--text-on-brand);
}
.process-button {
  background-color: var(--status-success-fg);
  color: var(--text-on-brand);
}

.confirmation-content .confirm-details {
  background: var(--ui-background);
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}
.confirmation-content .confirm-note {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

</style>