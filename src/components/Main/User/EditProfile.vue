<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"/>
      <form @submit.prevent="editUserProfile">
        <h2 class="form-header">Edit User Profile</h2>

        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="editedUser.firstName" placeholder="Enter first name" required type="text">
        </div>

        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="editedUser.lastName" placeholder="Enter last name" required type="text">
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="editedUser.email" placeholder="Enter email" required type="email">
        </div>

        <div class="form-group">
          <label for="password">New Password:</label>
          <input id="password" v-model="editedUser.password" placeholder="Enter new password" type="password">
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input id="confirmPassword" v-model="editedUser.confirmPassword" placeholder="Confirm new password"
                 type="password">
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit">
            <i class="fas fa-check"></i> Save Changes
          </button>
          <button class="back-button button" @click="goBack()">
            <i class="fas fa-arrow-left"></i> Back
          </button>
<!--          <router-link :to="{ name: 'UserProfile' }" class="back-button button">
            <i class="fas fa-arrow-left"></i> Back to Profile
          </router-link>-->
        </div>
      </form>
    </div>

    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeModal"
        @close="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
    />

    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    />
  </div>
</template>

<script>
// import axios from "axios"; // Unused, api instance is used
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";

/**
 * @file EditProfile.vue
 * @description This component allows the currently authenticated user to edit their profile information,
 * including first name, last name, email, and optionally, their password.
 * It fetches the user's current profile data to pre-fill the form and submits
 * changes to a backend API endpoint.
 * @component EditUserProfile
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'EditUserProfile',
  components: {LoadingModal, FailureModal, SuccessModal},
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object} editedUser - Object to hold the user data being edited.
   * @property {string|null} editedUser.id - User's ID. (Note: Initialized from route params, but API calls use '/me/profile',
   *                                         implying current user. ID for payload should ideally come from fetched profile).
   * @property {string} editedUser.firstName - User's first name.
   * @property {string} editedUser.lastName - User's last name.
   * @property {string} editedUser.email - User's email address.
   * @property {string} editedUser.password - New password input.
   * @property {string} editedUser.confirmPassword - Confirmation for the new password.
   * @property {Array<object>} editedUser.roles - User's roles (initialized with a default).
   * @property {object} loadingModal - Controls the loading modal.
   * @property {boolean} loadingModal.show - Visibility of loading modal.
   * @property {object} successModal - Controls the success modal.
   * @property {boolean} successModal.show - Visibility of success modal.
   * @property {string} successModal.message - Message for success modal.
   * @property {object} failModal - Controls the failure modal.
   * @property {boolean} failModal.show - Visibility of failure modal.
   * @property {string} failModal.message - Message for failure modal.
   */
  data() {
    return {
      editedUser: {
        id: this.$route.params.id, // Typically, for '/me/profile', ID isn't needed from route.
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        roles: [{roleName: "USER"}] // Default, will be overwritten by loaded profile if available
      },
      loadingModal: {show: false},
      successModal: {show: false, message: ""},
      failModal: {show: false, message: ""}
    };
  },
  /**
   * Lifecycle hook called after the component has been mounted.
   * Fetches the current user's profile to populate the form.
   */
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    /**
     * Fetches the profile data of the currently authenticated user from the API.
     * Populates the `editedUser` data object with the fetched information.
     * @async
     * @returns {void}
     */
    loadUserProfile() {
      // const token = localStorage.getItem('token'); // Redundant if api instance handles auth
      this.loadingModal.show = true; // Show loading modal during fetch
      api.get(`/api/v1/users/me/profile`)
          .then(response => {
            // Ensure response.data.data or response.data is correctly accessed based on API structure
            const user = response.data.data || response.data;
            if (user) {
              this.editedUser.id = user.id; // Set ID from fetched profile
              this.editedUser.firstName = user.firstName;
              this.editedUser.lastName = user.lastName;
              this.editedUser.email = user.email;
              this.editedUser.roles = user.roles || [{roleName: "USER"}]; // Preserve roles or default
            } else {
              throw new Error("User data not found in API response.");
            }
            this.loadingModal.show = false;
          })
          .catch(error => {
            console.error('Error retrieving user profile:', error.response || error);
            this.loadingModal.show = false;
            this.failModal.message = "Failed to load your profile. Please try again or re-login.";
            this.failModal.show = true;
          });
    },
    /**
     * Handles the submission of the user profile edit form.
     * Validates that new passwords match (if provided).
     * Constructs a payload and sends a PUT request to update the user's profile.
     * Shows appropriate loading, success, or failure modals.
     * @async
     * @returns {void}
     */
    editUserProfile() {
      this.loadingModal.show = true;

      if (this.editedUser.password && this.editedUser.password !== this.editedUser.confirmPassword) {
        this.loadingModal.show = false;
        this.failModal.message = "Passwords do not match.";
        this.failModal.show = true;
        return;
      }

      // const token = localStorage.getItem('token'); // Redundant if api instance handles auth

      const userPayload = {
        id: this.editedUser.id, // ID should be from the loaded profile
        firstName: this.editedUser.firstName,
        lastName: this.editedUser.lastName,
        email: this.editedUser.email,
        roles: this.editedUser.roles // Send roles back, backend should handle role management appropriately
      };

      // Only include password in the payload if it's being changed
      if (this.editedUser.password) {
        userPayload.password = this.editedUser.password;
      }

      api.put(`/api/v1/users/me/profile`, userPayload)
          .then(response => {
            this.loadingModal.show = false;
            this.successModal.message = "Profile updated successfully!";
            this.successModal.show = true;
            // Optionally, re-fetch profile or update local storage if user data is stored there
            if (response.data?.data?.user) { // If API returns updated user
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                window.dispatchEvent(new CustomEvent('auth-change')); // If navbar depends on this
            } else { // Fallback to re-fetch, or just rely on next login
                this.loadUserProfile(); // Re-fetch to show latest data if needed
            }
          })
          .catch(error => {
            console.error('Error updating user profile:', error.response || error);
            this.loadingModal.show = false;
            this.failModal.message = error.response?.data?.message || "Failed to update profile. Please try again.";
            this.failModal.show = true;
          });
    },
    /**
     * Closes any active success or failure modals.
     * @returns {void}
     */
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    /**
     * Navigates the user to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
/* Add your scoped styles here if needed */
</style>
