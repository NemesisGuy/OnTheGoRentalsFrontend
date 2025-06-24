<template>
  <div class="auth-container">
    <div class="auth-card">
      <form @submit.prevent="login" novalidate>
        <div class="form-header">
          <h1><i class="fas fa-sign-in-alt"></i> Member Login</h1>
          <p>Welcome back! Please enter your details.</p>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope"></i>
            <input
                type="email"
                placeholder="you@example.com"
                v-model.trim="email"
                id="email"
                autocomplete="email"
                required
                :class="{ 'is-invalid': validationErrors.email }"
            >
          </div>
          <small v-if="validationErrors.email" class="form-error">{{ validationErrors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input
                type="password"
                placeholder="Enter your password"
                v-model="password"
                id="password"
                autocomplete="current-password"
                required
                :class="{ 'is-invalid': validationErrors.password }"
            >
          </div>
          <small v-if="validationErrors.password" class="form-error">{{ validationErrors.password }}</small>
        </div>

        <button class="button login-button" type="submit" :disabled="isLoading">
          <i class="fas fa-sign-in-alt"></i> {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <div class="social-login-divider">
        <span class="divider-text">OR</span>
      </div>
      <div class="social-login-buttons">
        <a :href="googleLoginUrl" class="button google-button">
          <i class="fab fa-google"></i> Login with Google
        </a>
      </div>

      <div class="form-footer">

        <span>Don't remember your password?</span>
        <router-link to="/forgot-password" class="footer-link">Forgot Password?</router-link>
        <br>
        <span>Don't have an account?</span>
        <router-link :to="{ name: 'Signup' }" class="footer-link">Sign up here</router-link>



      </div>



    </div>

    <LoadingModal :show="isLoading" message="Logging in..."/>
    <SuccessModal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message"/>
    <FailureModal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
  </div>
</template>

<script>
// The script is unchanged and remains correct.
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";
import { resolvedApiBaseUrl } from "@/api";


export default {
  name: "Login",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      email: '', password: '', isLoading: false,
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
      validationErrors: {},
      googleLoginUrl: `${resolvedApiBaseUrl}/oauth2/authorization/google`,


    };
  },
  methods: {
    validateForm() {
      this.validationErrors = {};
      if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) this.validationErrors.email = "Please enter a valid email address.";
      if (!this.password) this.validationErrors.password = "Password is required.";
      return Object.keys(this.validationErrors).length === 0;
    },
    async login() {
      if (!this.validateForm()) return;
      this.isLoading = true;
      try {
        const response = await api.post('/api/v1/auth/login', { email: this.email, password: this.password });
        if (response.data?.status === "success" && response.data.data?.accessToken) {
          this.handleLoginSuccess(response.data.data);
        } else {
          throw new Error(response.data?.errors?.[0]?.message || "Login failed.");
        }
      } catch (error) { this.handleLoginFailure(error);
      } finally { this.isLoading = false; }
    },
    handleLoginSuccess(authData) {
      localStorage.setItem('accessToken', authData.accessToken);
      const user = { email: authData.email, roles: authData.roles || [] };
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-change'));
      this.showSuccessModal("Login successful! Redirecting...");
      setTimeout(() => this.onSuccessModalClose(), 1500);
    },
    handleLoginFailure(error) {
      let errorMessage = "An unexpected error occurred.";
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Cannot connect to the server. Please check your network.";
      } else {
        errorMessage = error.response?.data?.message || "Login failed. Please try again later.";
      }
      this.showFailureModal(errorMessage);
    },
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    showFailureModal(message) { this.failureModal = { show: true, message }; },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: "Home" });
    },
    closeFailureModal() { this.failureModal.show = false; },
  },
};
</script>

<style scoped>
/* Common styles for both Login and Signup */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  min-height: 80vh;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  overflow: hidden;
}

form {
  padding: 2.5rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}
.form-header h1 {
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0.5rem;
}
.form-header p {
  color: #6c757d;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.input-with-icon {
  position: relative;
}
.input-with-icon i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
}
.input-with-icon input {
  width: 100%;
  padding: 12px 15px 12px 40px; /* Add padding for the icon */
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
}
.input-with-icon input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.form-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.is-invalid {
  border-color: #dc3545 !important;
}

.button {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.login-button {
  background-color: #007bff;
  color: white;
}

.form-footer {
  background-color: #f8f9fa;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
}
.footer-link {
  font-weight: 600;
  color: #007bff;
  text-decoration: none;
  margin-left: 0.5rem;
}
.footer-link:hover {
  text-decoration: underline;
}

/* --- NEW STYLES FOR SOCIAL LOGIN --- */
.social-login-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #adb5bd;
  padding: 0 2.5rem;
  margin-bottom: 1.5rem;
}
.social-login-divider::before,
.social-login-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}
.divider-text {
  padding: 0 1rem;
  font-weight: 500;
  font-size: 0.9rem;
}
.social-login-buttons {
  padding: 0 2.5rem 1.5rem;
}
.google-button {
  background-color: #db4437;
  color: white;
}
.google-button:hover {
  background-color: #c23321;
}
</style>