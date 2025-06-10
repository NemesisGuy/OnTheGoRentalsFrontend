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

/**
 * @file CreateAboutUs.vue
 * @description A component for administrators to create new "About Us" entries.
 * It provides a form to input details such as address, office hours, email, and contact numbers.
 * Includes client-side validation and handles API submission with user feedback via modals.
 * @component AdminAboutUsCreate
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "AdminAboutUsCreate",
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object} aboutFormData - Holds the data input by the user in the form.
   * @property {string} aboutFormData.address - The address.
   * @property {string} aboutFormData.officeHours - The office hours.
   * @property {string} aboutFormData.email - The contact email address.
   * @property {string} aboutFormData.telephone - The telephone number.
   * @property {string} aboutFormData.whatsApp - The WhatsApp number.
   * @property {boolean} isLoading - Flag to control the loading state (e.g., for modal visibility and button disabling).
   * @property {string} formErrorMessage - Stores form-level validation error messages.
   * @property {object} successModalState - Controls the success modal.
   * @property {boolean} successModalState.show - Visibility of the success modal.
   * @property {string} successModalState.message - Message for the success modal.
   * @property {object} failureModalState - Controls the failure modal.
   * @property {boolean} failureModalState.show - Visibility of the failure modal.
   * @property {string} failureModalState.message - Message for the failure modal.
   */
  data() {
    return {
      aboutFormData: {
        address: '',
        officeHours: '',
        email: '',
        telephone: '',
        whatsApp: ''
      },
      isLoading: false,
      formErrorMessage: '',
      successModalState: {
        show: false,
        message: ""
      },
      failureModalState: {
        show: false,
        message: ""
      },
    };
  },
  methods: {
    /**
     * Handles the submission of the "About Us" entry form.
     * Performs client-side validation, then sends a POST request to the backend API
     * to create the new entry. Manages loading states and shows success/failure modals.
     * @async
     * @returns {void}
     */
    async addAboutEntry() {
      this.formErrorMessage = '';
      this.failureModalState.show = false;
      this.successModalState.show = false;

      if (!this.aboutFormData.address || !this.aboutFormData.officeHours || !this.aboutFormData.email) {
        this.formErrorMessage = "Address, Office Hours, and Email are required fields.";
        // Also show in modal for more prominent feedback
        this.showFailureModal("Please fill in all required fields: Address, Office Hours, and Email.");
        return;
      }
      // Add more specific validations if needed (e.g., email format)

      this.isLoading = true;

      try {
        const payload = { ...this.aboutFormData }; // Clone form data for payload
        console.log("Submitting About Us Data:", payload);

        const response = await api.post("/api/v1/admin/about-us", payload);

        if (response.data && response.data.status === "success") {
          this.showSuccessModal("About Us details have been added successfully!");
          this.resetForm();
          // Consider redirecting or providing a link to view all entries or the new entry
          // e.g., setTimeout(() => this.$router.push({ name: 'AboutUsManagement' }), 1500);
        } else {
          // Handle cases where API indicates success=false but doesn't throw HTTP error
          this.handleApiResponseError(response.data, "Failed to add About Us details due to an unexpected server response.");
        }
      } catch (error) {
        this.handleApiCatchError(error, "An error occurred while adding the About Us details.");
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Resets the form fields and any form-level error messages.
     * @returns {void}
     */
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
    /**
     * Shows the success modal with a specified message.
     * @param {string} message - The message to display in the success modal.
     * @returns {void}
     */
    showSuccessModal(message) {
      this.successModalState.message = message;
      this.successModalState.show = true;
    },
    /**
     * Shows the failure modal with a specified message.
     * @param {string} message - The message to display in the failure modal.
     * @returns {void}
     */
    showFailureModal(message) {
      this.failureModalState.message = message;
      this.failureModalState.show = true;
    },
    /**
     * Closes the success modal.
     * Can be extended to handle post-close actions like navigation.
     * @returns {void}
     */
    closeSuccessModal() {
      this.successModalState.show = false;
      // Example: this.$router.push({ name: 'AboutUsManagement' });
    },
    /**
     * Closes the failure modal.
     * @returns {void}
     */
    closeFailureModal() {
      this.failureModalState.show = false;
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },

    /**
     * Handles API response errors where the HTTP request itself was successful
     * but the response body indicates an application-level error.
     * @param {object|null} responseData - The data part of the API response.
     * @param {string} defaultMessage - Default error message if a specific one cannot be extracted.
     * @returns {void}
     */
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData?.errors?.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData?.message) {
        errorMsg = responseData.message;
      } else if (typeof responseData === 'string' && responseData.length < 200 && responseData.length > 0) {
        errorMsg = responseData;
      }
      console.error("API Response Error (AdminAboutUsCreate):", responseData);
      this.showFailureModal(errorMsg);
    },
    /**
     * Handles errors caught by the `catch` block of an API call (e.g., network errors, HTTP error statuses).
     * @param {Error} error - The error object from the `catch` block.
     * @param {string} defaultMessage - Default error message if a specific one cannot be extracted.
     * @returns {void}
     */
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AdminAboutUsCreate):", error.response || error.message || error);
      let errorMessage = defaultMessage;
      if (error.response?.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors?.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200 && apiResponse.length > 0) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check network connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.showFailureModal(errorMessage);
    },
  }
}
</script>

<style scoped>


</style>