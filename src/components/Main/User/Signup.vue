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
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "SignupPage", // Or RegisterPage
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      loadingModal: false,
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
    };
  },
  methods: {
    async register() {
      if (this.loadingModal) return;

      if (this.password !== this.confirmPassword) {
        this.failureModal.message = "Passwords do not match!";
        this.failureModal.show = true;
        return;
      }
      if (!this.firstName || !this.lastName || !this.email || !this.password) {
        this.failureModal.message = "Please fill in all required fields.";
        this.failureModal.show = true;
        return;
      }

      this.loadingModal = true;
      this.failureModal.show = false;

      try {
        const response = await api.post("/api/v1/auth/register", { // Ensure this path is correct
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        });

        console.log("Signup Response Data (wrapped):", response.data);

        if (response.data && response.data.status === "success" && response.data.data) {
          // Destructure from response.data.data (which is your AuthResponseDto)
          const { accessToken, email: responseEmail, roles, tokenType } = response.data.data;

          console.log("Unwrapped AuthResponseDto Data from Signup:", response.data.data);

          if (accessToken && tokenType === "Bearer") {
            localStorage.setItem('accessToken', accessToken);
            // Refresh token is an HttpOnly cookie set by the backend.

            const user = {
              email: responseEmail || this.email,
              roles: roles || ['USER'], // Default role for new signup if not in response
              // id: response.data.data.userId // if backend sends userId in AuthResponseDto's data
            };
            localStorage.setItem('user', JSON.stringify(user));

            window.dispatchEvent(new CustomEvent('auth-change'));

            this.successModal.message = "Registration successful! You are now logged in.";
            this.successModal.show = true;

            setTimeout(() => {
              this.onSuccessModalClose();
            }, 1500);
          } else {
            console.error("Signup successful, but AuthResponseDto did not contain expected token data. Received:", response.data.data);
            this.failureModal.message = "Signup successful, but received an unexpected response structure.";
            this.failureModal.show = true;
          }
        } else {
          let errorMsg = "Registration failed: Unexpected server response format.";
          if (response.data && response.data.errors && response.data.errors.length > 0) {
            errorMsg = response.data.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', ');
          } else if (response.data && response.data.message) {
            errorMsg = response.data.message;
          }
          console.error("Signup response was not successful or data was missing. Full response:", response.data);
          this.failureModal.message = errorMsg;
          this.failureModal.show = true;
        }
      } catch (error) {
        console.error("Signup API Error:", error);
        let errorMessage = "Registration failed. Please try again.";
        if (error.response && error.response.data) {
          const apiResponse = error.response.data; // Should be ApiResponse
          if (apiResponse.errors && apiResponse.errors.length > 0) {
            errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
            if (errorMessage.toLowerCase().includes("email is already taken")) { // More specific check
              errorMessage = "An account with this email already exists. Please try logging in.";
            }
          } else if (typeof apiResponse === 'string') {
            errorMessage = apiResponse;
          } else if (apiResponse.message) {
            errorMessage = apiResponse.message;
          } else if (error.response.status === 303 || error.response.status === 409) { // SEE_OTHER or CONFLICT for existing email
            errorMessage = "An account with this email already exists.";
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your network connection.";
        } else {
          errorMessage = "An unexpected error occurred during registration. Please try again.";
        }
        this.failureModal.message = errorMessage;
        this.failureModal.show = true;
      } finally {
        this.loadingModal = false;
      }
    },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: "Home" });
      setTimeout(() => {
        window.location.reload();
      }, 0);
    },
    closeFailureModal() {
      this.failureModal.show = false;
    },
    goToLogin() {
      if (this.loadingModal) return;
      this.$router.push({ name: 'Login' });
    },
  }
};
</script>

<style scoped>

</style>



