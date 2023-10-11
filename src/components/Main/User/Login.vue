<template>
  <div class="card-container">
    <div class="form-container">
      <form @submit="login">
        <div class="form-header">
          <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
        </div>
  <!--add autocomplete to username and password-->

        <div class="form-group">
          <label for="username"><i class="fas fa-user"></i> Username:</label>
          <input type="text" placeholder="Enter username" v-model="username" id="username">
        </div>

        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" placeholder="Enter email" v-model="email" id="email">
        </div>

        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input type="password" placeholder="Enter password" v-model="password" id="password" autocomplete="current-password">
        </div>
        <div class="button-container">
          <button class="add-button button" type="submit"><i class="fas fa-sign-in-alt"></i> Login:</button>
          <button class="read-button button" @click="goToSignup"><i class="fas fa-user-plus"></i> Signup</button>
        </div>
      </form>
    </div>
  </div>
  <div class="modal-body">
    <success-modal :show="successModal.show" @close="closeModal" :message="successModal.message" />
    <failure-modal :show="failureModal.show" @close="closeModal" :message="failureModal.message" />
  </div>
</template>

<script>
import axios from 'axios';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";

export default {
  computed: {
  },
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  name: "Login",
  methods: {
    goToSignup() {
      this.$router.push('/signup');
    },
    login() {
      this.loadingModal= true;
      // Make the API call to /user/login
      axios.post('/api/user/login', {
        username: this.username,
        email: this.email,
        password: this.password
      })
          .then(response => {
            // Handle the response
            console.log("Login successful");
            console.log(response.data);
            console.log(response);
            this.loadingModal = false;
            this.successModal.message = "Login successful";
            this.successModal.show = true;
          })
          .catch(error => {
            // Handle the error
            console.error(error);
            this.loadingModal= false;
            console.log("An error occurred: Login failed");
            console.log(error);
            this.successModal.show = false;
            this.failureModal.show = true;
            this.failureModal.message = "Login failed";
          });
    }, closeModal() {
      this.showConfirmationModal = false;
      this.successModal.show = false;
      this.failureModal.show = false;
    },
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      loadingModal: false,
      successModal: {show:false, message: ""},
      failureModal: {show:false, message: ""},
      confirmationModal: {show:false, message: ""},
    }
  },
  mounted() {
    console.log('Login mounted');
  }
};
</script>

<style scoped>
/* Add your custom styles here */


</style>
