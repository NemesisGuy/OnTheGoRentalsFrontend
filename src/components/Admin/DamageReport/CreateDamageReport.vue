
<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>

      <form ref="reportForm" @submit.prevent="createReport">
        <div class="form-header">
          <h2>Create Damage Report</h2>
        </div>
        <div class="form-group">
          <label for="rental">Rental:</label>
          <select v-model="selectedRental" id="rental" name="rental" required>
            <option value="" disabled>Select a rental</option>
            <option v-for="rental in rentals" :key="rental.uuid" :value="rental.uuid">
              Rental ID: {{ rental.uuid }} | User: {{ rental.user?.email || 'N/A' }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="dateAndTime">Date and Time:</label>
          <input id="dateAndTime" v-model="selectedDateAndTime" name="dateAndTime" type="datetime-local" required />
        </div>
        <div class="form-group">
          <label for="location">Location:</label>
          <input id="location" v-model="location" name="location" type="text" required />
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <input id="description" v-model="description" name="description" type="text" required />
        </div>
        <div class="form-group">
          <label for="repairCost">Repair Cost:</label>
          <input id="repairCost" v-model.number="repairCost" name="repairCost" type="number" min="0" step="0.01" required />
        </div>
        <div class="form-group button-container">
          <button type="submit" class="confirm-button button">
            <i class="fas fa-check"></i> Save
          </button>
          <button type="button" class="back-button button" @click="goBack">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    />
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api"; // Use pre-configured api instance
import { formatInputDateTime } from '@/utils/dateUtils'; // For default date

export default {
  name: 'AdminCreateDamageReport',
  components: { FailureModal, SuccessModal, LoadingModal },
  data() {
    return {
      rentals: [],
      selectedRental: '',
      description: '',
      selectedDateAndTime: formatInputDateTime(new Date()), // Default to current date and time
      location: '',
      repairCost: 0,
      loadingModal: { show: false },
      errorMessage: '',
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  mounted() {
    this.fetchRentalOptions();
  },
  methods: {
    async fetchRentalOptions() {
      this.loadingModal.show = true;
      try {
        // Manual Authorization header removed.
        const response = await api.get('/api/v1/admin/rentals');
        const { data, errors, status } = response.data || {};
        if (status === "success" && Array.isArray(data)) {
          this.rentals = data;
          console.log("Fetched Rentals for dropdown:", this.rentals.length);
        } else {
          throw new Error(errors?.map(e=>e.message).join(", ") || "Failed to fetch rental options: Unexpected response format.");
        }
      } catch (error) {
        console.error("Error fetching rental options:", error.response || error.message || error);
        this.failModal.message = error.message || "Failed to fetch rental list for selection.";
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    async createReport() {
      if (!this.selectedRental || !this.selectedDateAndTime || !this.location || !this.description || this.repairCost == null || this.repairCost < 0) {
        this.errorMessage = "All fields are required, and repair cost must be zero or positive.";
        this.failModal.message = this.errorMessage; // Show in modal
        this.failModal.show = true;
        return;
      }
      this.loadingModal.show = true;
      this.errorMessage = ""; // Clear previous errors
      this.failModal.show = false;
      this.successModal.show = false;

      try {
        const reportPayload = {
          rentalUuid: this.selectedRental,
          dateAndTime: new Date(this.selectedDateAndTime).toISOString(), // Ensure ISO format
          location: this.location,
          description: this.description,
          repairCost: parseFloat(this.repairCost) // Ensure it's a number
        };
        console.log("Submitting Damage Report Payload:", reportPayload);

        // Manual Authorization header removed.
        const response = await api.post("/api/v1/admin/damage-reports", reportPayload);

        const { errors, status, data: responseData } = response.data || {}; // Destructure response data
        if (status === "success" && responseData) {
          this.successModal.message = "Damage report created successfully.";
          this.successModal.show = true;
          this.resetForm(); // Reset form only on success
        } else {
          throw new Error(errors?.map(e=>e.message).join(", ") || "Failed to create damage report: Server indicated an issue.");
        }
      } catch (error) {
        console.error("Error creating damage report:", error.response || error.message || error);
        let errorMessageText = error.message || "An error occurred while creating the damage report.";
        if (error.response?.data) {
          if (error.response.data.errors?.length > 0) {
            errorMessageText = error.response.data.errors.map(e => e.message || e.field).join('; ');
          } else if (error.response.data.message) {
            errorMessageText = error.response.data.message;
          }
        }
        this.errorMessage = errorMessageText;
        this.failModal.message = errorMessageText;
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    resetForm() {
      this.selectedRental = "";
      this.description = "";
      this.selectedDateAndTime = formatInputDateTime(new Date()); // Reset to current date/time
      this.location = "";
      this.repairCost = 0;
      this.errorMessage = ""; // Clear form error message
    },
    goBack() {
      this.$router.go(-1);
    },
    closeModal() {
      const wasSuccess = this.successModal.show;
      this.successModal.show = false;
      this.failModal.show = false;
      this.errorMessage = "";
      if (wasSuccess) {
        this.$router.push({name: 'DamageReportManagement'});
      }
    },
  },
};
</script>

<style scoped>

</style>