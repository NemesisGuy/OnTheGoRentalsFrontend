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
        const response = await api.post('/api/v1/auth/login', {
          email: this.email,
          password: this.password
        });

        console.log("Login Response Data:", response.data);

        // Destructure what's available in the response body
        // refreshToken is no longer expected here.
        const { accessToken, email: responseEmail, roles, accessTokenExpiresIn, tokenType } = response.data;

        // Check for the presence of the accessToken and correct tokenType
        if (accessToken && tokenType === "Bearer") {
          localStorage.setItem('accessToken', accessToken);
          // DO NOT try to get refreshToken from response.data to store in localStorage.
          // It's now an HttpOnly cookie handled by the browser.

          const user = {
            email: responseEmail || this.email,
            roles: roles || [],
            // id: userIdFromServerIfAvailable // If your AuthResponseDto includes user ID
          };
          localStorage.setItem('user', JSON.stringify(user));

          // Dispatch auth-change event so Navbar and other components can update
          window.dispatchEvent(new CustomEvent('auth-change'));

          this.successModal.message = "Login successful!";
          this.successModal.show = true;

          setTimeout(() => {
            this.onSuccessModalClose();
          }, 1000);

        } else {
          console.error("Login response did not contain expected access token data or tokenType. Received:", response.data);
          this.failureModal.message = "Login failed: Invalid server response structure.";
          this.failureModal.show = true;
        }

      } catch (error) {
        console.error("Login API Error:", error);
        let errorMessage = "Login failed. Please check your credentials.";
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.status === 401) {
            errorMessage = "Invalid email or password.";
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your network connection.";
        } else {
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
      this.$router.push({name: "Home"});
      setTimeout(() => {
        window.location.reload();
      }, 0);
    },
    closeModal() {
      this.failureModal.show = false;
    },
    goToSignup() {
      if (this.loadingModal) return;
      this.$router.push({name: 'Signup'});
    },
  },
};
</script>