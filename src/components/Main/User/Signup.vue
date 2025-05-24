<template>
  <loading-modal v-if="loadingModal" show/>
  <div class="card-container">
    <div class="form-container" @submit.prevent="register">
      <form>
        <h2 class="form-header"><i class="fas fa-user-plus"></i> Signup</h2>


        <div class="form-group">
          <label for="first-name"><i class="fas fa-user"></i> First Name:</label>
          <input type="text" id="firstName" name="firstName" placeholder="Enter your first name" v-model="firstName"
                 required>
        </div>
        <div class="form-group">
          <label for="last-name"><i class="fas fa-user"></i> Last Name:</label>
          <input type="text" id="lastName" name="lastName" placeholder="Enter your last name" v-model="lastName"
                 required>
        </div>

        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" v-model="password"
                 required>
        </div>
        <div class="form-group">
          <label for="confirm-password"><i class="fas fa-lock"></i> Confirm Password:</label>
          <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your password"
                 required>
        </div>
        <div class="button-container">
          <button class="add-button button" type="submit"><i class="fas fa-user-plus"></i> Signup</button>
          <button class="read-button button" @click="goToLogin"><i class="fas fa-sign-in-alt"></i> Login</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body">
    <success-modal :show="successModal.show" @close="closeModal" :message="successModal.message"/>
    <failure-modal :show="failureModal.show" @close="closeModal" :message="failureModal.message"/>
  </div>

</template>

<script>
// import axios from "axios"; // Not needed if using 'api' instance
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
// import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue"; // Not used in this snippet
import api from "@/api"; // Your configured Axios instance

export default {
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
    // ConfirmationModal,
  },
  name: "Signup", // Or Register
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      // confirmPassword: "", // You have an input for this, but it's not bound or used yet
      loadingModal: false,
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
      // confirmationModal: { show: false, message: "" },
    };
  },
  methods: {
    async register() { // Changed to async
      // Basic client-side validation (you should add more)
      const confirmPasswordInput = document.getElementById('confirm-password'); // Get confirm password value
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      if (this.password !== confirmPassword) {
        this.failureModal.message = "Passwords do not match!";
        this.failureModal.show = true;
        return;
      }
      if (!this.firstName || !this.lastName || !this.email || !this.password) {
        this.failureModal.message = "Please fill in all required fields.";
        this.failureModal.show = true;
        return;
      }

      if (this.loadingModal) return;
      this.loadingModal = true;
      this.failureModal.show = false; // Reset failure modal

      try {
        const response = await api.post("/api/user/register", {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        });

        console.log("Registration successful. Response:", response);

        // Backend now sends AuthResponseDto in the body and refresh token as HttpOnly cookie
        // Destructure the access token and user info from response.data
        const { accessToken, email: responseEmail, roles, tokenType } = response.data;

        if (accessToken && tokenType === "Bearer") {
          // Store the access token in localStorage
          localStorage.setItem('accessToken', accessToken);

          // Store basic user info (email, roles) in localStorage
          // This helps the Navbar and other components update without an immediate extra API call
          const user = {
            email: responseEmail || this.email, // Use email from response if available
            roles: roles || ['USER'],      // Default to USER role if not provided, or use from response
          };
          localStorage.setItem('user', JSON.stringify(user));

          // Dispatch an event so other components (like Navbar) can update their state
          window.dispatchEvent(new CustomEvent('auth-change'));

          this.successModal.message = "Registration successful! You are now logged in.";
          this.successModal.show = true;

          // After showing success, redirect to home
          setTimeout(() => {
            this.onSuccessModalClose(); // This method will handle redirect
          }, 1500); // Give user a moment to see the success message

        } else {
          console.error("Registration response did not contain expected token data. Received:", response.data);
          this.failureModal.message = "Registration failed: Unexpected server response.";
          this.failureModal.show = true;
        }

      } catch (error) {
        console.error("Registration API Error:", error);
        this.loadingModal = false; // Ensure loading modal is hidden on error
        let errorMessage = "Registration failed. Please try again.";
        if (error.response) {
          if (error.response.status === 409 || error.response.status === 303) { // 303 SEE_OTHER from your backend for existing email
            errorMessage = "An account with this email already exists.";
          } else if (error.response.data) {
            if (typeof error.response.data === 'string' && error.response.data.length < 100) { // Avoid huge HTML error pages
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          }
        }
        this.failureModal.message = errorMessage;
        this.failureModal.show = true;
      } finally {
        // This will run regardless of success or failure of the try block,
        // but we already set loadingModal = false in success and error specific blocks.
        // If an unexpected error occurs before those, this ensures it's reset.
        if (this.loadingModal) { // Only set if it wasn't already set by success/error
          this.loadingModal = false;
        }
      }
    },
    onSuccessModalClose() { // New method to handle successful registration/login redirect
      this.successModal.show = false;
      this.$router.push({ name: "Home" });
      setTimeout(() => {
        window.location.reload(); // Reload to ensure Navbar and other states are fresh
      }, 0);
    },
    goToLogin() {
      if (this.loadingModal) return;
      this.$router.push({ name: 'Login' });
    },
    closeModal() {
      // this.showConfirmationModal = false; // If you re-add confirmation modal
      this.successModal.show = false;
      this.failureModal.show = false;
    },
  }
};
</script>

<style scoped>
/* Add your component-specific styles here */


</style>



