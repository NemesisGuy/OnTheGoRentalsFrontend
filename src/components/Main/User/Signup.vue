<template>
  <div class="auth-container">
    <div class="auth-card">
      <form @submit.prevent="register" novalidate>
        <div class="form-header">
          <h1><i class="fas fa-user-plus"></i> Create Account</h1>
          <p>Join us and start your journey today!</p>
        </div>

        <div class="name-group">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" placeholder="John" v-model.trim="firstName" required autocomplete="given-name" :class="{ 'is-invalid': validationErrors.firstName }">
            <small v-if="validationErrors.firstName" class="form-error">{{ validationErrors.firstName }}</small>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" placeholder="Doe" v-model.trim="lastName" required autocomplete="family-name" :class="{ 'is-invalid': validationErrors.lastName }">
            <small v-if="validationErrors.lastName" class="form-error">{{ validationErrors.lastName }}</small>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" placeholder="you@example.com" v-model.trim="email" required autocomplete="email" :class="{ 'is-invalid': validationErrors.email }">
          </div>
          <small v-if="validationErrors.email" class="form-error">{{ validationErrors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" placeholder="Min. 6 characters" v-model="password" required autocomplete="new-password" :class="{ 'is-invalid': validationErrors.password }">
          </div>
          <small v-if="validationErrors.password" class="form-error">{{ validationErrors.password }}</small>
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input type="password" id="confirm-password" placeholder="Re-enter password" v-model="confirmPassword" required autocomplete="new-password" :class="{ 'is-invalid': validationErrors.confirmPassword }">
          </div>
          <small v-if="validationErrors.confirmPassword" class="form-error">{{ validationErrors.confirmPassword }}</small>
        </div>

        <button class="button signup-button" type="submit" :disabled="isLoading">
          <i class="fas fa-user-plus"></i> {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <div class="form-footer">
        <span>Already have an account?</span>
        <router-link :to="{ name: 'Login' }" class="footer-link">Log in here</router-link>
      </div>
    </div>
  </div>

  <LoadingModal :show="isLoading" message="Creating your account..."/>
  <SuccessModal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message"/>
  <FailureModal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
</template>

<script>
// The script is unchanged and remains correct.
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "SignupPage",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
      isLoading: false,
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
      validationErrors: {},
    };
  },
  methods: {
    validateForm() {
      this.validationErrors = {};
      if (!this.firstName) this.validationErrors.firstName = "First name is required.";
      if (!this.lastName) this.validationErrors.lastName = "Last name is required.";
      if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) this.validationErrors.email = "Please enter a valid email address.";
      if (!this.password || this.password.length < 6) this.validationErrors.password = "Password must be at least 6 characters long.";
      if (this.password !== this.confirmPassword) this.validationErrors.confirmPassword = "Passwords do not match.";
      return Object.keys(this.validationErrors).length === 0;
    },
    async register() {
      if (!this.validateForm()) return;
      this.isLoading = true;
      try {
        const response = await api.post("/api/v1/auth/register", { firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password });
        if (response.data?.status === "success" && response.data.data?.accessToken) {
          this.handleRegistrationSuccess(response.data.data);
        } else {
          throw new Error(response.data?.errors?.[0]?.message || "Registration failed.");
        }
      } catch (error) { this.handleRegistrationFailure(error);
      } finally { this.isLoading = false; }
    },
    handleRegistrationSuccess(authData) {
      localStorage.setItem('accessToken', authData.accessToken);
      const user = { email: authData.email, roles: authData.roles || ['USER'] };
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-change'));
      this.showSuccessModal("Registration successful! You are now logged in.");
    },
    handleRegistrationFailure(error) {
      let errorMessage = "An unexpected error occurred.";
      if (error.response?.data?.errors?.[0]?.message.toLowerCase().includes("email")) {
        errorMessage = "An account with this email already exists.";
      } else {
        errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
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
  }
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
  max-width: 480px; /* Slightly wider for signup form */
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

.name-group {
  display: flex;
  gap: 1.5rem;
}
.name-group .form-group {
  flex: 1;
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
  padding: 12px 15px 12px 40px;
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
.signup-button {
  background-color: #28a745;
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

@media (max-width: 576px) {
  .name-group {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>