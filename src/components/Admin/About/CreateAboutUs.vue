<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <!-- LoadingModal should be controlled by a data property, not just v-if on its own -->
      <LoadingModal v-if="isLoading" :show="isLoading" message="Saving..."/>

      <form @submit.prevent="addAboutEntry"> <!-- Renamed method for clarity -->
        <h2 class="form-header"><i class="fa fa-info-circle"></i> Add About Us Details</h2>
        <div class="form-group">
          <label for="address">Address:</label>
          <input id="address" v-model="aboutFormData.address" placeholder="Enter address" required type="text">
        </div>
        <div class="form-group">
          <label for="officeHours">Office Hours:</label>
          <input id="officeHours" v-model="aboutFormData.officeHours" placeholder="Enter office hours" required type="text">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="aboutFormData.email" placeholder="Enter email" required type="email">
        </div>
        <div class="form-group">
          <label for="telephone">Telephone Number:</label>
          <input id="telephone" v-model="aboutFormData.telephone" placeholder="Enter telephone number" type="tel">
        </div>
        <div class="form-group">
          <label for="whatsapp">WhatsApp Number:</label>
          <input id="whatsapp" v-model="aboutFormData.whatsApp" placeholder="Enter WhatsApp number" type="tel">
        </div>
        <!-- Display general form error message if needed from your validation -->
        <div v-if="formErrorMessage" class="error-message">{{ formErrorMessage }}</div>
        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="isLoading"><i class="fas fa-check"></i> Save</button>
          <button type="button" @click="goBack" class="back-button button" :disabled="isLoading"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modals should be outside the form, but within the component's root usually -->
  <div class="modal-teleporter"> <!-- Or any suitable place for modals -->
    <SuccessModal :show="successModalState.show" @close="closeSuccessModal" :message="successModalState.message"/>
    <FailureModal :show="failureModalState.show" @close="closeFailureModal" :message="failureModalState.message"/>
  </div>
</template>

<script>
// import axios from "axios"; // Not needed if using api instance
import api from "@/api"; // Your configured Axios instance
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: "AdminAboutUsCreate", // Or a more descriptive name
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal
  },
  data() {
    return {
      aboutFormData: { // Use a distinct object for form data
        address: '',
        officeHours: '',
        email: '',
        telephone: '',
        whatsApp: ''
      },
      isLoading: false, // For general loading state / disabling buttons
      formErrorMessage: '', // For displaying form-level validation errors
      successModalState: { // Renamed for clarity, controls SuccessModal
        show: false,
        message: ""
      },
      failureModalState: { // Renamed for clarity, controls FailureModal
        show: false,
        message: ""
      },
    };
  },
  methods: {
    async addAboutEntry() { // Renamed method and made async
      this.formErrorMessage = ''; // Clear previous form errors
      this.failureModalState.show = false; // Hide failure modal
      this.successModalState.show = false; // Hide success modal

      // Basic client-side validation (add more as needed)
      if (!this.aboutFormData.address || !this.aboutFormData.officeHours || !this.aboutFormData.email) {
        this.formErrorMessage = "Address, Office Hours, and Email are required.";
        this.showFailureModal("Please fill in all required fields."); // Also show in modal
        return;
      }

      this.isLoading = true;

      try {
        // The 'api' instance from api.js already has the interceptor to add the token
        // Payload should match AboutUsCreateDTO
        const payload = {
          address: this.aboutFormData.address,
          officeHours: this.aboutFormData.officeHours,
          email: this.aboutFormData.email,
          telephone: this.aboutFormData.telephone,
          whatsApp: this.aboutFormData.whatsApp,
        };
        console.log("Submitting About Us Data:", payload);

        const response = await api.post("/api/v1/admin/about-us", payload);
        console.log('About Us details added successfully. Response:', response.data);

        if (response.data && response.data.status === "success") {
          // Assuming response.data.data is the created AboutUsResponseDTO
          this.showSuccessModal("About Us details have been added successfully!");
          this.resetForm(); // Reset form on success
          // Optionally redirect after a delay or on modal close
          // setTimeout(() => this.$router.push({ name: 'AdminAboutUsList' }), 2000); // Example redirect
        } else {
          this.handleApiResponseError(response.data, "Failed to add About Us details: Unexpected response.");
        }
      } catch (error) {
        this.handleApiCatchError(error, "An error occurred while adding the About Us details.");
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.aboutFormData = {
        address: '',
        officeHours: '',
        email: '',
        telephone: '',
        whatsApp: ''
      };
      this.formErrorMessage = '';
    },
    showSuccessModal(message) {
      this.successModalState.message = message;
      this.successModalState.show = true;
    },
    showFailureModal(message) {
      this.failureModalState.message = message;
      this.failureModalState.show = true;
    },
    closeSuccessModal() { // Renamed for clarity
      this.successModalState.show = false;
      // Optionally navigate away or refresh data here
      // this.$router.push({ name: 'AdminAboutUsList' }); // Example
    },
    closeFailureModal() { // Renamed for clarity
      this.failureModalState.show = false;
    },
    goBack() {
      this.$router.go(-1); // Or navigate to a specific admin dashboard route
    },

    // Re-using helper methods for handling ApiResponse from backend
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData && typeof responseData === 'string' && responseData.length < 200) {
        errorMsg = responseData;
      } else if (responseData && responseData.message) { // If ApiResponse has a direct message field for errors
        errorMsg = responseData.message;
      }
      console.error("API Response Error (AboutUs Create):", responseData);
      this.showFailureModal(errorMsg);
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AboutUs Create):", error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data; // This should be your ApiResponse
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check network connection.";
      }
      this.showFailureModal(errorMessage);
    },
  }
}
</script>

<style scoped>


</style>