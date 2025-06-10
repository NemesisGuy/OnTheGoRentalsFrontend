<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <!-- LoadingModal can be used if a full overlay is desired during submission -->
      <!-- <LoadingModal :show="isLoading" message="Saving driver..."/> -->
      <form @submit.prevent="addDriver">
        <div class="form-header">
          <h2><i class="fas fa-user-plus"></i> Add Driver</h2>
        </div>

        <div class="form-group">
          <label for="firstName">First Name:</label> <!-- Corrected 'firstname' to 'firstName' for ID/for -->
          <input type="text" id="firstName" v-model="driver.firstName" required placeholder="Enter First Name">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label> <!-- Corrected 'lastname' to 'lastName' for ID/for -->
          <input type="text" id="lastName" v-model="driver.lastName" required placeholder="Enter Last Name">
        </div>
        <div class="form-group">
          <label for="licenseCode">License Code:</label>
          <input type="text" id="licenseCode" v-model="driver.licenseCode" required placeholder="Enter license code">
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="isLoading">
            <i class="fas fa-check"></i> {{ isLoading ? 'Adding...' : 'Add' }}
          </button>
          <button class="back-button button" type="button" @click="goBack" :disabled="isLoading">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>
    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="onSuccessModalClose" <!-- Changed to specific handler -->
    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailureModal" <!-- Changed to specific handler -->
    />
  </div>
</template>

<script>
// LoadingModal is imported but not used in the template. isLoading flag controls button state.
// import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";
// import { formatInputDateTime } from '@/utils/dateUtils'; // Not used in this version of the script

/**
 * @file CreateDriver.vue
 * @description Admin component for creating new driver entries.
 * Provides a form for inputting driver details (first name, last name, license code).
 * Handles API submission and provides user feedback via modals.
 * @component AdminCreateDriver
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminCreateDriver',
  components: {
    // LoadingModal, // Not actively used in template, isLoading data property used for button state
    SuccessModal,
    FailureModal
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object} driver - Object holding the form data for the new driver.
   * @property {string} driver.firstName - First name of the driver.
   * @property {string} driver.lastName - Last name of the driver.
   * @property {string} driver.licenseCode - License code of the driver.
   * @property {string} errorMessage - Stores form-level validation or API error messages.
   * @property {object} successModal - Controls the success modal state.
   * @property {object} failModal - Controls the failure modal state.
   * @property {boolean} isLoading - Flag to indicate if an API operation is in progress, used to disable buttons.
   */
  data() {
    return {
      driver: {
        firstName: "",
        lastName: "",
        licenseCode: "",
      },
      errorMessage: "",
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      isLoading: false, // Changed from loadingModal object to boolean
    };
  },
  methods: {
    /**
     * Handles the submission of the new driver form.
     * Performs client-side validation for required fields.
     * Sends a POST request to the backend API to create the driver.
     * Manages loading state, shows success/failure modals, and resets form on success.
     * @async
     * @returns {void}
     */
    async addDriver() {
      this.errorMessage = '';
      this.failModal.show = false;
      this.successModal.show = false;

      if (!this.driver.firstName || !this.driver.lastName || !this.driver.licenseCode) {
        this.errorMessage = "All fields (First Name, Last Name, License Code) are required.";
        this.showFailureModal(this.errorMessage);
        return;
      }

      this.isLoading = true;

      try {
        const response = await api.post('/api/v1/admin/drivers', this.driver);

        if (response.data && response.data.status === "success") {
          console.log('Driver added successfully:', response.data);
          this.showSuccessModal("Driver added successfully!");
          this.resetForm();
        } else {
          const errorMsg = response.data?.errors?.map(e => e.message).join(", ") || response.data?.message || "Failed to add driver: Unexpected server response.";
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error("Error adding driver:", error.response || error.message || error);
        let errMsg = "An error occurred while adding the driver.";
        if (error.response?.data) {
            if (error.response.data.errors?.length > 0) {
                errMsg = error.response.data.errors.map(e => e.message || e.field).join('; ');
            } else if (error.response.data.message) {
                errMsg = error.response.data.message;
            }
        } else if (error.message && !error.message.includes("Network Error")) {
            errMsg = error.message;
        }
        this.errorMessage = errMsg;
        this.showFailureModal(errMsg);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Resets the driver form fields to their initial empty states.
     * @returns {void}
     */
    resetForm() {
      this.driver = {
        firstName: "",
        lastName: "",
        licenseCode: "",
      };
      this.errorMessage = "";
    },
    /**
     * Handles actions after the success modal is acknowledged (or auto-closed).
     * Hides the success modal and navigates user to the drivers management page.
     * @returns {void}
     */
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: 'DriversManagement' });
    },
    /**
     * Closes the failure modal.
     * @returns {void}
     */
    closeFailureModal() {
      this.failModal.show = false;
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
    /** Helper to show success modal. @param {string} message */
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    /** Helper to show failure modal. @param {string} message */
    showFailureModal(message) { this.failModal = { show: true, message }; },
  },
  /**
   * Lifecycle hook called when the component is created.
   * Can be used to set initial default values if needed.
   */
  created() {
    // No specific defaults needed beyond data() for this form.
  }
};
</script>

<style scoped>

</style>