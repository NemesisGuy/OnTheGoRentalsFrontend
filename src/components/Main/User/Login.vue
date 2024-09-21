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
          <input type="password" placeholder="Enter password" v-model="password" id="password" autocomplete="current-password">
        </div>

        <div class="button-container">
          <button class="add-button button" type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
          <button class="read-button button" @click="goToSignup"><i class="fas fa-user-plus"></i> Signup</button>
        </div>
      </form>
    </div>
    <div class="modal-body">
      <success-modal :show="successModal.show" @close="onSuccessModalClose" :message="successModal.message" />
      <failure-modal :show="failureModal.show" @close="closeModal" :message="failureModal.message" />
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

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
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
    };
  },
  methods: {
    login() {
      this.loadingModal = true;

      axios.post('http://localhost:8080/api/user/authenticate', {
        email: this.email,
        password: this.password
      })
          .then(response => {
            console.log(response.data);

            // Assuming response.data contains the token
            const token = response.data;
            console.log("Token: " + token);
            localStorage.setItem('token', token);

            this.successModal.message = "Login successful";
            this.successModal.show = true;

            // Redirect to home page after showing success modal
            setTimeout(() => {
              this.onSuccessModalClose();
            }, 1000); // Adjust the time as needed
          })
          .catch(error => {
            console.error(error);
            this.loadingModal = false;
            console.log("An error occurred: Login failed");
            this.successModal.show = false;
            this.failureModal.show = true;
            this.failureModal.message = "Login failed";
          });
    },
    onSuccessModalClose() {
      this.successModal.show = false;
      this.$router.push({ name: "Home" }); // Redirect to home
      setTimeout(() => {
        window.location.reload(); // Reload the page to update the navbar
      }, 0); // Use a timeout to ensure the redirect takes effect first
    },
    closeModal() {
      this.successModal.show = false;
      this.failureModal.show = false;
    },
    goToSignup() {
      this.$router.push({ name: 'Signup' });
    },
  },
};
</script>
