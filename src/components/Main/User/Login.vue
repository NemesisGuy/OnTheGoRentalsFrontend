<template>
  <div class="card-container">
    <div class="form-container">
      <form @submit.prevent="login" novalidate>
        <div class="form-header">
          <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input
              type="email"
              placeholder="Enter your email"
              v-model.trim="email"
              id="email"
              autocomplete="email"
              required
              :class="{ 'is-invalid': validationErrors.email }"
          >
          <small v-if="validationErrors.email" class="form-text text-danger">{{ validationErrors.email }}</small>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input
              type="password"
              placeholder="Enter your password"
              v-model="password"
              id="password"
              autocomplete="current-password"
              required
              :class="{ 'is-invalid': validationErrors.password }"
          >
          <small v-if="validationErrors.password" class="form-text text-danger">{{ validationErrors.password }}</small>
        </div>

        <!-- Action Buttons -->
        <div class="button-container">
          <button class="add-button button" type="submit" :disabled="isLoading">
            <i class="fas fa-sign-in-alt"></i> {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
          <button type="button" class="read-button button" @click="goToSignup" :disabled="isLoading">
            <i class="fas fa-user-plus"></i> Signup
          </button>
        </div>
      </form>
    </div>

    <!-- Modals for feedback -->
    <div class="modal-body">
      <LoadingModal :show="isLoading" message="Logging in..."/>
      <SuccessModal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message"/>
      <FailureModal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
    </div>
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api"; // Your configured Axios instance

/**
 * @file Login.vue
 * @description A component for user authentication. It provides a form for email and
 * password input, handles submission to the backend API, manages user state in
 * localStorage, and provides clear feedback on success or failure.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-06-11 (Updated)
 */
export default {
  name: "Login",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      /** @type {string} The user's email address. */
      email: '',
      /** @type {string} The user's password. */
      password: '',
      /** @type {boolean} Controls the loading state, disabling form elements. */
      isLoading: false,
      /** @type {Object} State for the success feedback modal. */
      successModal: { show: false, message: "" },
      /** @type {Object} State for the failure feedback modal. */
      failureModal: { show: false, message: "" },
      /** @type {Object} Holds client-side validation error messages for form fields. */
      validationErrors: {},
    };
  },
  methods: {
    /**
     * Validates the login form inputs.
     * @returns {boolean} True if the form is valid, otherwise false.
     */
    validateForm() {
      this.validationErrors = {};
      if (!this.email) {
        this.validationErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.validationErrors.email = "Please enter a valid email address.";
      }
      if (!this.password) {
        this.validationErrors.password = "Password is required.";
      }
      return Object.keys(this.validationErrors).length === 0;
    },

    /**
     * Handles the login form submission.
     * It validates the form, calls the login API, and manages the application state
     * based on the API response.
     * @returns {Promise<void>}
     */
    async login() {
      if (!this.validateForm()) {
        const firstError = Object.values(this.validationErrors)[0];
        this.showFailureModal(firstError || "Please correct the errors before submitting.");
        return;
      }
      if (this.isLoading) return;

      this.isLoading = true;
      this.failureModal.show = false;

      try {
        const response = await api.post('/api/v1/auth/login', {
          email: this.email,
          password: this.password
        });

        if (response.data?.status === "success" && response.data.data?.accessToken) {
          this.handleLoginSuccess(response.data.data);
        } else {
          throw new Error(response.data?.errors?.[0]?.message || "Login failed: Unexpected server response.");
        }
      } catch (error) {
        this.handleLoginFailure(error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Processes a successful login response.
     * Stores user data and tokens in localStorage and dispatches an auth event.
     * @param {object} authData - The 'data' object from a successful API response (AuthResponseDto).
     */
    handleLoginSuccess(authData) {
      localStorage.setItem('accessToken', authData.accessToken);
      // The http-only refresh token cookie is handled automatically by the browser.

      const user = {
        email: authData.email,
        roles: authData.roles || [],
      };
      localStorage.setItem('user', JSON.stringify(user));

      // Dispatch a global event to notify other components (like the navbar) of the auth change.
      window.dispatchEvent(new CustomEvent('auth-change'));

      this.showSuccessModal("Login successful! Redirecting...");
      setTimeout(() => this.onSuccessModalClose(), 1500); // Redirect after a short delay
    },

    /**
     * Processes a failed login attempt.
     * Displays a user-friendly error message.
     * @param {Error} error - The error object from the Axios catch block.
     */
    handleLoginFailure(error) {
      console.error("Login API Error:", error.response || error);
      let errorMessage = "An unexpected error occurred.";

      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        if (status === 401 || status === 403) {
          errorMessage = "Invalid email or password. Please try again.";
        } else {
          errorMessage = responseData?.errors?.[0]?.message || responseData?.message || "Login failed due to a server error.";
        }
      } else if (error.message.includes("Network Error")) {
        errorMessage = "No response from server. Please check your network connection.";
      }
      this.showFailureModal(errorMessage);
    },

    /**
     * Shows the success modal with a given message.
     * @param {string} message - The message to display.
     */
    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },

    /**
     * Shows the failure modal with a given message.
     * @param {string} message - The message to display.
     */
    showFailureModal(message) {
      this.failureModal = { show: true, message };
    },

    /**
     * Closes the success modal and redirects the user to the homepage.
     */
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: "Home" });
      // The reload is often unnecessary with proper state management but can be a
      // simple way to ensure all components refresh. Consider removing it later.
      // setTimeout(() => window.location.reload(), 50);
    },

    /**
     * Closes the failure modal.
     */
    closeFailureModal() {
      this.failureModal.show = false;
    },

    /**
     * Navigates the user to the signup page.
     */
    goToSignup() {
      if (this.isLoading) return;
      this.$router.push({ name: 'Signup' });
    },
  },
};
</script>

<style scoped>
.is-invalid {
  border-color: #dc3545;
}
</style>