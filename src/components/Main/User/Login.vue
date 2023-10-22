<template>
  <div class="card-container">
    <div class="form-container">
      <form  @submit.prevent="login">
        <div class="form-header">
          <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
        </div>
  <!--add autocomplete to username and password-->

<!--        <div class="form-group">
          <label for="username"><i class="fas fa-user"></i> Username:</label>
          <input type="text" placeholder="Enter username" v-model="username" id="username">
        </div>-->

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
import store from "@/store/store";

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

    login() {
      this.loadingModal = true;

      axios.post('http://localhost:8080/api/user/authenticate', {
        email: this.email,
        password: this.password
      })
          .then(response => {
            // Log the response data
            console.log(response.data);

            // Assuming response.data contains the token
            const token = response.data;
            console.log("Token: " + token);
            // Store the token in localStorage
            localStorage.setItem('token', token);
            // Set the Authorization header
          //  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Set the user in the store
          //  store.commit('setUser', response.data.user);
            this.successModal.message = "Login successful";
            this.successModal.show = true;
            this.$router.push( {name : "Home"} );

            // Rest of your code
            // ...
          })
          .catch(error => {
            // Handle the error
            console.error(error);
            this.loadingModal = false;
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
    goToSignup() {
      this.$router.push({name: 'Signup'});//eredirects to signup page
    },
  },
  data() {
    return {

      email: '',
      password: '',
      loadingModal: false,
      successModal: {show:false, message: ""},
      failureModal: {show:false, message: ""},
      confirmationModal: {show:false, message: ""},
    }
  },

};
</script>

<style scoped>
/* Add your custom styles here */


</style>
