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
// import axios from 'axios'; // Not needed directly if using 'api' instance
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api"; // Your configured Axios instance

export default {
  components: {
    LoadingModal, // Keep if you plan to use it as a full overlay
    SuccessModal,
    FailureModal,
  },
  name: "Login",
  data() {
    return {
      email: '',
      password: '',
      loadingModal: false, // Used to disable buttons and show loading text
      successModal: {show: false, message: ""},
      failureModal: {show: false, message: ""},
    };
  },
  methods: {
    async login() {
      if (this.loadingModal) return; // Prevent multiple submissions
      this.loadingModal = true;
      this.failureModal.show = false; // Reset failure modal

      // ***** CRUCIAL DEBUGGING STEP *****
      console.log("Values before API call - Email:", this.email, "Password:", this.password);
      // You can also check their types:
      // console.log("Type of Email:", typeof this.email, "Type of Password:", typeof this.password);

      try {
        const response = await api.post('/api/user/authenticate', {
          email: this.email,
          password: this.password
        });

        console.log("Login Response Data:", response.data);

        // Destructure the tokens and other info from the response
        // Make sure these keys match exactly what your backend's AuthResponseDto sends
        const { accessToken, refreshToken, email: responseEmail, roles, accessTokenExpiresIn, tokenType } = response.data; // Renamed 'email' from response to 'responseEmail' to avoid conflict if needed

        if (accessToken && refreshToken && tokenType === "Bearer") {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Optionally store user information (but not sensitive data like password)
          // Ensure 'responseEmail' and 'roles' are present in response.data if you use them
          const user = {
            email: responseEmail || this.email, // Use email from response or form
            roles: roles || [],                 // Use roles from response or an empty array
          };
          localStorage.setItem('user', JSON.stringify(user));

          // You might want to store accessTokenExpiresIn to manage token lifetime proactively
          // localStorage.setItem('accessTokenExpiresIn', accessTokenExpiresIn);

          this.successModal.message = "Login successful!";
          this.successModal.show = true;

          // Redirect to home page after showing success modal
          setTimeout(() => {
            this.onSuccessModalClose();
          }, 1000); // Adjust the time as needed

        } else {
          // Handle cases where the response structure is not as expected
          console.error("Login response did not contain expected token data. Received:", response.data);
          this.failureModal.message = "Login failed: Invalid server response.";
          this.failureModal.show = true;
        }

      } catch (error) {
        console.error("Login API Error:", error);
        let errorMessage = "Login failed. Please check your credentials.";
        if (error.response && error.response.data) {
          // Try to get a more specific message from the backend
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.status === 401 && (this.email === '' || this.password === '')) {
            errorMessage = "Email and Password cannot be empty."; // More specific if they are indeed empty
          } else if (error.response.status === 401) {
            errorMessage = "Invalid email or password.";
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "No response from server. Please check your network connection.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = "An unexpected error occurred. Please try again.";
        }
        this.failureModal.message = errorMessage;
        this.failureModal.show = true;
      } finally {
        this.loadingModal = false;
      }
    },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({name: "Home"}); // Redirect to home
      // The page reload is often to ensure components (like a navbar showing login state) re-evaluate.
      // With Vue's reactivity, this might not always be necessary if your navbar correctly
      // watches for changes in login state (e.g., presence of tokens in localStorage).
      // However, a reload is a simple way to ensure everything is fresh.
      setTimeout(() => {
        window.location.reload();
      }, 0);
    },
    closeModal() {
      // this.successModal.show = false; // Already handled by onSuccessModalClose
      this.failureModal.show = false;
    },
    goToSignup() {
      if (this.loadingModal) return;
      this.$router.push({name: 'Signup'});
    },
  },
};
</script>