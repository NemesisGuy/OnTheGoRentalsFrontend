<template>
  <loading-modal v-if="loadingModal" :show="true"/> <!-- Simplified :show binding -->
  <div class="card-container">
    <div class="form-container">
      <form @submit.prevent="register">
        <h2 class="form-header"><i class="fas fa-user-plus"></i> Signup</h2>

        <div class="form-group">
          <label for="firstName"><i class="fas fa-user"></i> First Name:</label>
          <input type="text" id="firstName" name="firstName" placeholder="Enter your first name" v-model="firstName"
                 required>
        </div>
        <div class="form-group">
          <label for="lastName"><i class="fas fa-user"></i> Last Name:</label>
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
          <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your password" v-model="confirmPassword"
                 required>
        </div>
        <div class="button-container">
          <button class="add-button button" type="submit"><i class="fas fa-user-plus"></i> Signup</button>
          <button class="read-button button" type="button" @click="goToLogin"><i class="fas fa-sign-in-alt"></i> Login</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body">
    <success-modal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message"/>
    <failure-modal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
  </div>

</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "SignupPage",
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
      confirmPassword: "", // Added for v-model
      loadingModal: false,
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
    };
  },
  methods: {
    register() { // Removed async
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
      this.failureModal.show = false; // Reset failure modal

      api.post("/api/v1/auth/register", {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password
      })
          .then(response => {
            console.log("Signup Response Data (wrapped):", response.data);

            if (response.data && response.data.status === "success" && response.data.data) {
              const { accessToken, email: responseEmail, roles, tokenType } = response.data.data;
              console.log("Unwrapped AuthResponseDto Data from Signup:", response.data.data);

              if (accessToken && tokenType === "Bearer") {
                localStorage.setItem('accessToken', accessToken);
                // Refresh token is an HttpOnly cookie set by the backend.

                const user = {
                  email: responseEmail || this.email,
                  roles: roles || ['USER'],
                };
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new CustomEvent('auth-change'));

                this.successModal.message = "Registration successful! You are now logged in.";
                this.successModal.show = true;
                // The onSuccessModalClose method (called by the modal's @close event) will handle navigation
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
          })
          .catch(error => {
            console.error("Signup API Error:", error);
            let errorMessage = "Registration failed. Please try again.";
            if (error.response && error.response.data) {
              const apiResponse = error.response.data;
              if (apiResponse.errors && apiResponse.errors.length > 0) {
                errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
                if (errorMessage.toLowerCase().includes("email is already taken")) {
                  errorMessage = "An account with this email already exists. Please try logging in.";
                }
              } else if (typeof apiResponse === 'string' && apiResponse.length > 0 && apiResponse.length < 250) {
                errorMessage = apiResponse;
              } else if (apiResponse.message) {
                errorMessage = apiResponse.message;
              } else if (error.response.status === 303 || error.response.status === 409) {
                errorMessage = "An account with this email already exists.";
              }
            } else if (error.request) {
              errorMessage = "No response from server. Please check your network connection.";
            } else {
              errorMessage = "An unexpected error occurred during registration. Please try again.";
            }
            this.failureModal.message = errorMessage;
            this.failureModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: "Home" });
      // Consider if reload is truly needed or if state can be managed reactively
      // setTimeout(() => {
      //   window.location.reload();
      // }, 50); // Small delay if reload is necessary
    },
    closeFailureModal() { // This method will be correctly called by FailureModal
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
/* Basic styling for demonstration - adapt to your project's design system */
.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh; /* Adjust as needed */
  padding: 20px;
  background-color: #f4f7f6; /* Light background for the page */
}

.form-container {
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px; /* Max width for the form */
}

.form-header {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8em;
}
.form-header .fas {
  margin-right: 10px;
  color: #007bff; /* Or your theme color */
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}
.form-group label .fas {
  margin-right: 8px;
  color: #007bff; /* Or your theme color */
  width: 16px; /* Ensure consistent icon spacing */
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
  border-color: #007bff; /* Highlight on focus */
  outline: none;
}

.button-container {
  display: flex;
  gap: 15px; /* Space between buttons */
  margin-top: 25px;
}

.button {
  flex-grow: 1; /* Make buttons share space equally */
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500; /* Adjusted font weight */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  text-decoration: none;
  color: white;
}
.button:hover {
  opacity: 0.9;
}
.button:active {
  transform: translateY(1px);
}

.add-button { /* Signup button */
  background-color: #28a745; /* Green */
}

.read-button { /* Login button */
  background-color: #007bff; /* Blue */
}

.modal-body {
  /* This div is just a wrapper for modals, usually doesn't need direct styling
     unless it's part of a specific layout for how modals are presented globally. */
}

/* Responsive adjustments if needed */
@media (max-width: 480px) {
  .form-container {
    padding: 20px;
  }
  .button-container {
    flex-direction: column; /* Stack buttons on very small screens */
  }
}
</style>