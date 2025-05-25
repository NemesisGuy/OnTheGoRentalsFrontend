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
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api"; // Your configured Axios instance

export default {
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  name: "Login",
  data() {
    return {
      email: '',
      password: '',
      loadingModal: false,
      successModal: {show: false, message: ""},
      failureModal: {show: false, message: ""},
    };
  },
  methods: {
    async login() {
      if (this.loadingModal) return;
      this.loadingModal = true;
      this.failureModal.show = false;

      console.log("Values before API call - Email:", this.email, "Password:", this.password);

      try {
        const response = await api.post('/api/v1/auth/login', { // Ensure this path is correct
          email: this.email,
          password: this.password
        });

        console.log("Full Login Response Data (wrapped):", response.data); // Log the entire ApiResponse

        // Check if the response status is "success" and data exists
        if (response.data && response.data.status === "success" && response.data.data) {
          // Destructure from response.data.data (which is your AuthResponseDto)
          const { accessToken, email: responseEmail, roles, accessTokenExpiresIn, tokenType } = response.data.data;

          console.log("Unwrapped AuthResponseDto Data:", response.data.data);

          // Check for the presence of the accessToken and correct tokenType
          if (accessToken && tokenType === "Bearer") {
            localStorage.setItem('accessToken', accessToken);
            // Refresh token is now an HttpOnly cookie handled by the browser.

            const user = {
              email: responseEmail || this.email,
              roles: roles || [],
              // id: response.data.data.userId // If your AuthResponseDto from backend includes userId
            };
            localStorage.setItem('user', JSON.stringify(user));

            window.dispatchEvent(new CustomEvent('auth-change'));

            this.successModal.message = "Login successful!";
            this.successModal.show = true;

            setTimeout(() => {
              this.onSuccessModalClose();
            }, 1000);

          } else {
            console.error("Login successful, but AuthResponseDto did not contain expected token data. Received AuthResponseDto:", response.data.data);
            this.failureModal.message = "Login successful, but received an unexpected response structure.";
            this.failureModal.show = true;
          }
        } else {
          // Handle cases where response.data.status is not "success" or response.data.data is missing
          // This might happen if the ApiResponseWrapperAdvice has an issue or if an error was wrapped unexpectedly.
          // Or if GlobalExceptionHandler returned a success-like status for an error (less likely).
          let errorMsg = "Login failed: Unexpected server response format.";
          if (response.data && response.data.errors && response.data.errors.length > 0) {
            errorMsg = response.data.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join(', ');
          } else if (response.data && response.data.message) { // If your error ApiResponse has a single message
            errorMsg = response.data.message;
          }
          console.error("Login response was not successful or data was missing. Full response:", response.data);
          this.failureModal.message = errorMsg;
          this.failureModal.show = true;
        }

      } catch (error) {
        console.error("Login API Error (catch block):", error);
        let errorMessage = "Login failed. Please check your credentials.";

        // Axios error structure: error.response contains the server's response
        if (error.response && error.response.data) {
          const apiResponse = error.response.data; // This should be your ApiResponse for errors
          if (apiResponse.errors && apiResponse.errors.length > 0) {
            errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
          } else if (typeof apiResponse === 'string') { // Fallback if error response is just a string
            errorMessage = apiResponse;
          } else if (apiResponse.message) { // If your error response has a general message field
            errorMessage = apiResponse.message;
          } else if (error.response.status === 401) {
            errorMessage = "Invalid email or password.";
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your network connection.";
        } else {
          errorMessage = "An unexpected error occurred during login. Please try again.";
        }
        this.failureModal.message = errorMessage;
        this.failureModal.show = true;
      } finally {
        this.loadingModal = false;
      }
    },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({name: "Home"});
      setTimeout(() => {
        window.location.reload();
      }, 0);
    },
    closeModal() { // Renamed to closeFailureModal for clarity if only used by FailureModal
      this.failureModal.show = false;
    },
    goToSignup() {
      if (this.loadingModal) return;
      this.$router.push({name: 'Signup'});
    },
  },
};
</script>