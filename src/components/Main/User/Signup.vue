<template>
  <div class="card-container">
    <div class="form-container">
      <form @submit.prevent="register" novalidate>
        <h2 class="form-header"><i class="fas fa-user-plus"></i> Create Your Account</h2>

        <!-- First Name Input -->
        <div class="form-group">
          <label for="firstName"><i class="fas fa-user"></i> First Name:</label>
          <input
              type="text"
              id="firstName"
              placeholder="Enter your first name"
              v-model.trim="firstName"
              required
              autocomplete="given-name"
              :class="{ 'is-invalid': validationErrors.firstName }"
          >
          <small v-if="validationErrors.firstName" class="form-text text-danger">{{ validationErrors.firstName }}</small>
        </div>

        <!-- Last Name Input -->
        <div class="form-group">
          <label for="lastName"><i class="fas fa-user"></i> Last Name:</label>
          <input
              type="text"
              id="lastName"
              placeholder="Enter your last name"
              v-model.trim="lastName"
              required
              autocomplete="family-name"
              :class="{ 'is-invalid': validationErrors.lastName }"
          >
          <small v-if="validationErrors.lastName" class="form-text text-danger">{{ validationErrors.lastName }}</small>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input
              type="email"
              id="email"
              placeholder="Enter your email"
              v-model.trim="email"
              required
              autocomplete="email"
              :class="{ 'is-invalid': validationErrors.email }"
          >
          <small v-if="validationErrors.email" class="form-text text-danger">{{ validationErrors.email }}</small>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input
              type="password"
              id="password"
              placeholder="Enter your password"
              v-model="password"
              required
              autocomplete="new-password"
              :class="{ 'is-invalid': validationErrors.password }"
          >
          <small v-if="validationErrors.password" class="form-text text-danger">{{ validationErrors.password }}</small>
        </div>

        <!-- Confirm Password Input -->
        <div class="form-group">
          <label for="confirm-password"><i class="fas fa-lock"></i> Confirm Password:</label>
          <input
              type="password"
              id="confirm-password"
              placeholder="Confirm your password"
              v-model="confirmPassword"
              required
              autocomplete="new-password"
              :class="{ 'is-invalid': validationErrors.confirmPassword }"
          >
          <small v-if="validationErrors.confirmPassword" class="form-text text-danger">{{ validationErrors.confirmPassword }}</small>
        </div>

        <!-- Action Buttons -->
        <div class="button-container">
          <button class="add-button button" type="submit" :disabled="isLoading">
            <i class="fas fa-user-plus"></i> {{ isLoading ? 'Creating Account...' : 'Signup' }}
          </button>
          <button class="read-button button" type="button" @click="goToLogin" :disabled="isLoading">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body">
    <LoadingModal :show="isLoading" message="Creating your account..."/>
    <SuccessModal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message"/>
    <FailureModal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

/**
 * @file SignupPage.vue
 * @description A component for new user registration. It includes a form for user details,
 * client-side validation, and handles the API call to the registration endpoint.
 * On successful registration, it automatically logs the user in.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-06-11 (Updated)
 */
export default {
  name: "SignupPage",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      /** @type {string} The user's first name. */
      firstName: "",
      /** @type {string} The user's last name. */
      lastName: "",
      /** @type {string} The user's email address. */
      email: "",
      /** @type {string} The user's chosen password. */
      password: "",
      /** @type {string} The password confirmation field. */
      confirmPassword: "",
      /** @type {boolean} Controls the loading state. */
      isLoading: false,
      /** @type {Object} State for the success feedback modal. */
      successModal: { show: false, message: "" },
      /** @type {Object} State for the failure feedback modal. */
      failureModal: { show: false, message: "" },
      /** @type {Object} Holds client-side validation errors. */
      validationErrors: {},
    };
  },
  methods: {
    /**
     * Validates the entire signup form before submission.
     * @returns {boolean} True if all fields are valid, otherwise false.
     */
    validateForm() {
      this.validationErrors = {};
      if (!this.firstName) this.validationErrors.firstName = "First name is required.";
      if (!this.lastName) this.validationErrors.lastName = "Last name is required.";
      if (!this.email) {
        this.validationErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.validationErrors.email = "Please enter a valid email address.";
      }
      if (!this.password) {
        this.validationErrors.password = "Password is required.";
      } else if (this.password.length < 6) {
        this.validationErrors.password = "Password must be at least 6 characters long.";
      }
      if (this.password !== this.confirmPassword) {
        this.validationErrors.confirmPassword = "Passwords do not match.";
      }
      return Object.keys(this.validationErrors).length === 0;
    },

    /**
     * Handles the signup form submission. Validates inputs and calls the registration API.
     * @returns {Promise<void>}
     */
    async register() {
      if (!this.validateForm()) {
        const firstError = Object.values(this.validationErrors)[0];
        this.showFailureModal(firstError || "Please correct the errors and try again.");
        return;
      }
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        const response = await api.post("/api/v1/auth/register", {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        });

        if (response.data?.status === "success" && response.data.data?.accessToken) {
          this.handleRegistrationSuccess(response.data.data);
        } else {
          throw new Error(response.data?.errors?.[0]?.message || "Registration failed: Unexpected server response.");
        }
      } catch (error) {
        this.handleRegistrationFailure(error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Processes a successful registration response, automatically logging the user in.
     * @param {object} authData - The 'data' object from a successful API response (AuthResponseDto).
     */
    handleRegistrationSuccess(authData) {
      localStorage.setItem('accessToken', authData.accessToken);
      const user = { email: authData.email, roles: authData.roles || ['USER'] };
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-change'));
      this.showSuccessModal("Registration successful! You are now logged in.");
    },

    /**
     * Processes a failed registration attempt and displays a user-friendly error.
     * @param {Error} error - The error object from the Axios catch block.
     */
    handleRegistrationFailure(error) {
      console.error("Signup API Error:", error.response || error);
      let errorMessage = "An unexpected error occurred during registration.";
      if (error.response?.data?.errors?.[0]?.message.toLowerCase().includes("email")) {
        errorMessage = "An account with this email already exists. Please try logging in.";
      } else {
        errorMessage = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || "Registration failed. Please try again.";
      }
      this.showFailureModal(errorMessage);
    },

    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },
    showFailureModal(message) {
      this.failureModal = { show: true, message };
    },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: "Home" });
    },
    closeFailureModal() {
      this.failureModal.show = false;
    },
    goToLogin() {
      if (this.isLoading) return;
      this.$router.push({ name: 'Login' });
    },
  }
};
</script>

<style scoped>
.is-invalid {
  border-color: #dc3545;
}
</style>