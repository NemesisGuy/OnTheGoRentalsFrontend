<template>
  <div class="card-container">
    <div class="form-container">
      <form @submit.prevent="login">
        <div class="form-header">
          <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
        </div>

        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" placeholder="Enter email" v-model="email" id="email" autocomplete="email">
        </div>

        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input type="password" placeholder="Enter password" v-model="password" id="password"
                 autocomplete="current-password">
        </div>

        <div class="button-container">
          <button class="add-button button" type="submit" :disabled="loadingModal">
            <i class="fas fa-sign-in-alt"></i> {{ loadingModal ? 'Logging in...' : 'Login' }}
          </button>
          <button class="read-button button" @click="goToSignup" :disabled="loadingModal">
            <i class="fas fa-user-plus"></i> Signup
          </button>
        </div>
      </form>
    </div>
    <div class="modal-body">
      <!-- Consider using your LoadingModal here if it's a full-screen overlay -->
      <!-- <loading-modal :show="loadingModal" message="Logging in..."/> -->
      <success-modal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message"/>
      <failure-modal :show="failureModal.show" @close="closeModal" :message="failureModal.message"/>
    </div>
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Imported but not used in template
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

/**
 * @file Login.vue
 * @description Component for user login. It provides a form for email and password submission,
 * handles the authentication process with the backend API, stores authentication tokens
 * and user information upon success, and provides feedback through modals.
 * @component Login
 */
export default {
  /**
   * Components registered for use within this component.
   * @type {object}
   * @property {Component} LoadingModal - (Note: Imported but not currently used in the template.
   *                                     A data property `loadingModal` (boolean) is used to manage loading state for the button).
   * @property {Component} SuccessModal - Modal for displaying login success messages.
   * @property {Component} FailureModal - Modal for displaying login failure messages.
   */
  components: {
    LoadingModal, // Not used in template, data.loadingModal (boolean) is used instead
    SuccessModal,
    FailureModal,
  },
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "Login",
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {string} email - The email address entered by the user.
   * @property {string} password - The password entered by the user.
   * @property {boolean} loadingModal - Flag to indicate if the login process is active.
   *                                    Used to change button text and disable buttons, not for the LoadingModal component here.
   * @property {object} successModal - Controls the success modal.
   * @property {boolean} successModal.show - Visibility of success modal.
   * @property {string} successModal.message - Message for success modal.
   * @property {object} failureModal - Controls the failure modal.
   * @property {boolean} failureModal.show - Visibility of failure modal.
   * @property {string} failureModal.message - Message for failure modal.
   */
  data() {
    return {
      email: '',
      password: '',
      loadingModal: false, // Boolean flag for login button state, not for the LoadingModal component
      successModal: {show: false, message: ""},
      failureModal: {show: false, message: ""},
    };
  },
  methods: {
    /**
     * Handles the user login attempt.
     * It sends the email and password to the backend API for authentication.
     * On successful login, it stores the access token and user details in localStorage,
     * dispatches an 'auth-change' event, shows a success message, and redirects the user.
     * On failure, it displays an appropriate error message.
     * Manages a loading state for the login button.
     * @async
     * @returns {void}
     */
    async login() {
      if (this.loadingModal) return; // Prevent multiple submissions
      this.loadingModal = true;      // Indicate loading state (e.g., for button text/disabled state)
      this.failureModal.show = false;  // Reset failure modal

      console.log("Attempting login with - Email:", this.email); // Password should not be logged

      try {
        const response = await api.post('/api/v1/auth/login', {
          email: this.email,
          password: this.password
        });

        console.log("Full Login API Response:", response.data);

        if (response.data && response.data.status === "success" && response.data.data) {
          const { accessToken, email: responseEmail, roles /*, userId (if available) */ } = response.data.data;

          if (accessToken) { // Assuming tokenType "Bearer" is implicit or handled by backend/api setup
            localStorage.setItem('accessToken', accessToken);

            const user = {
              email: responseEmail || this.email, // Use email from response if available
              roles: roles || [],
              // id: userId // Store user ID if backend provides it
            };
            localStorage.setItem('user', JSON.stringify(user));

            window.dispatchEvent(new CustomEvent('auth-change')); // Notify other components

            this.successModal.message = "Login successful! Redirecting...";
            this.successModal.show = true;

            // Redirect after a short delay to allow user to see success message
            setTimeout(() => {
              this.onSuccessModalClose();
            }, 1000);

          } else {
            console.error("Login API response successful, but token data is missing or invalid. Response data:", response.data.data);
            this.failureModal.message = "Login successful, but received an unexpected authorization response.";
            this.failureModal.show = true;
          }
        } else {
          let errorMsg = "Login failed: Unexpected server response.";
          if (response.data && response.data.errors && response.data.errors.length > 0) {
            errorMsg = response.data.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', ');
          } else if (response.data && response.data.message) {
            errorMsg = response.data.message;
          }
          console.error("Login API response status not 'success' or data missing. Full response:", response.data);
          this.failureModal.message = errorMsg;
          this.failureModal.show = true;
        }

      } catch (error) {
        console.error("Login API Error (catch block):", error.response || error.message || error);
        let errorMessage = "Login failed. Please check your credentials and try again.";

        if (error.response && error.response.data) {
          const apiResponse = error.response.data;
          if (apiResponse.errors && apiResponse.errors.length > 0) {
            errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
          } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
            errorMessage = apiResponse;
          } else if (apiResponse.message) {
            errorMessage = apiResponse.message;
          } else if (error.response.status === 401) { // Unauthorized
            errorMessage = "Invalid email or password.";
          }
        } else if (error.request) { // Network error
          errorMessage = "No response from the server. Please check your internet connection.";
        } else { // Other errors
          errorMessage = "An unexpected error occurred during login.";
        }
        this.failureModal.message = errorMessage;
        this.failureModal.show = true;
      } finally {
        this.loadingModal = false; // Reset loading state
      }
    },
    /**
     * Handles actions after the success modal is acknowledged (or auto-closed).
     * Hides the success modal, navigates to the Home page, and forces a page reload
     * to ensure the application state is fully updated after login.
     * @returns {void}
     */
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({name: "Home"}); // Ensure "Home" is a valid route name
      // Reload to apply auth changes globally, e.g., for Navbar update if event system isn't fully robust
      // or if other non-Vue parts of the page need to update.
      setTimeout(() => { // Short delay to ensure router push completes before reload
        window.location.reload();
      }, 0);
    },
    /**
     * Closes the failure modal.
     * @returns {void}
     */
    closeFailureModal() { // Renamed for clarity
      this.failureModal.show = false;
    },
    /**
     * Navigates the user to the Signup page if not currently in a loading state.
     * @returns {void}
     */
    goToSignup() {
      if (this.loadingModal) return;
      this.$router.push({name: 'Signup'}); // Ensure "Signup" is a valid route name
    },
  },
};
</script>