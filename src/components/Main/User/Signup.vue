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

import axios from "axios";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
/*import store from "@/store/store";*/
import api from "@/api";

export default {
  computed: {},
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  data() {
    return {
      userName: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      successMessage: "",
      failureMessage: "",
      errorMessage: '',
      loadingModal: false,
      successModal: {show: false, message: ""},
      failureModal: {show: false, message: ""},
      confirmationModal: {show: false, message: ""},

    };
  },
  methods: {
    register() {
      this.loadingModal = true;
      api
          .post("/api/user/register", {

            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password

            //user authenticators
          })
          .then(response => {
            // Handle success
            console.log("Registration successful");
            console.log(response);
            this.loadingModal = false;

            const token = response.data.accessToken; // Assuming response.data contains the token
            // Save the token to the store
            /* store.commit('setToken', token);//vuex*/
            console.log("Response token:  " + token); // Output the value of the token
            // console.log("Current stored token:  " +store.state.token); // Output the value of the token
            // Assuming you have received and stored the token in response.data.accessToken
            localStorage.setItem('token', response.data.accessToken);
            this.successModal.message = "Registration successful";
            this.successModal.show = true;
            //  localStorage.setItem('token', null);//this will log the users out
            //implement as button to nav or profile from to loge the user out

            this.$router.push({name: "Home"});//redirects to home page
          })
          .catch(error => {
            // Handle error
            this.loadingModal = false;
            console.log("An error occurred: registration failed");
            console.log(error);
            this.successModal.show = false;
            this.failureModal.show = true;
            this.failureModal.message = "Registration failed";
          });
    },
    goToLogin() {
      this.$router.push({name: 'Login'});//redrects to login page
    },
    closeModal() {
      this.showConfirmationModal = false;
      this.successModal.show = false;
      this.failureModal.show = false;
    },
  }
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>



