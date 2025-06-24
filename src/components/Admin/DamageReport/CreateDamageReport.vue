
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
import api from "@/api";

export default {
  components: { FailureModal, SuccessModal, LoadingModal },
  data() {
    return {
      rentals: [],
      selectedRental: '',
      description: '',
      selectedDateAndTime: '',
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
        const response = await api.get('/api/v1/admin/rentals', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { data, errors, status } = response.data || {};
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to fetch rentals");
        }
        this.rentals = data || [];
        console.log("Fetched Rentals:", this.rentals); // Debug
      } catch (error) {
        console.error("Error fetching rentals:", error);
        this.failModal.message = "Failed to fetch rental list";
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    async createReport() {
      if (!this.selectedRental || !this.selectedDateAndTime || !this.location || !this.description || this.repairCost == null) {
        this.errorMessage = "All fields are required.";
        return;
      }
      this.loadingModal.show = true;
      this.errorMessage = "";
      try {
        const formattedDate = new Date(this.selectedDateAndTime).toISOString();
        const report = {
          rentalUuid: this.selectedRental, // Use rentalUuid to match backend
          dateAndTime: formattedDate,
          location: this.location,
          description: this.description,
          repairCost: this.repairCost,
        };
        console.log("Request Payload:", report); // Debug
        console.log("Request Headers:", { Authorization: `Bearer ${localStorage.getItem("token")}` }); // Debug
        const response = await api.post("/api/v1/admin/damage-reports", report, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { errors, status } = response.data || {};
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to create damage report");
        }
        this.successModal.message = "Damage report created successfully.";
        this.successModal.show = true;
        this.resetForm();
      } catch (error) {
        console.error("Error creating damage report:", error);
        let errorMessage = error.message || "An error occurred while creating the damage report.";
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data.errors?.join(", ") || "Invalid data. Please check the entered values.";
          } else if (error.response.status === 404) {
            errorMessage = "Rental not found. Please select a valid rental.";
          } else if (error.response.status === 500) {
            errorMessage = error.response.data.errors?.join(", ") || "Server error. Please check the backend logs.";
          }
        }
        this.errorMessage = errorMessage;
        this.failModal.message = errorMessage;
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    resetForm() {
      this.selectedRental = "";
      this.description = "";
      this.selectedDateAndTime = "";
      this.location = "";
      this.repairCost = 0;
    },
    goBack() {
      this.$router.go(-1);
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.errorMessage = "";
      if (!this.successModal.show) {
        this.$router.push("/admin/damage-reports");
      }
    },
  },
};
</script>

<style scoped>

</style>