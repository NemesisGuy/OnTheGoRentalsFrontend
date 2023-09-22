<template>
  <loading-modal v-if="loadingModal" show/>
  <div class ="card-container">
    <div class="form-container" @submit.prevent="register">
      <form>
        <h2 class="form-header"> <i class="fas fa-user-plus"></i> Signup</h2>

        <div class="form-group">
          <label for="username"><i class="fas fa-user"></i> Username:</label>
          <input type="text" id="userName" name="userName" placeholder="Enter your username" v-model="userName" required>
        </div>
        <div class="form-group">
          <label for="first-name"><i class="fas fa-user"></i> First Name:</label>
          <input type="text" id="firstName" name="firstName" placeholder="Enter your first name" v-model="firstName" required>
        </div>
        <div class="form-group">
          <label for="last-name"><i class="fas fa-user"></i> Last Name:</label>
          <input type="text" id="lastName" name="lastName" placeholder="Enter your last name" v-model="lastName" required>
        </div>
        <div class="form-group">
          <label for="phone-number"><i class="fas fa-phone"></i> Phone Number:</label>
          <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="Enter your phone number" v-model="phoneNumber" required>
        </div>
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i> Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="confirm-password"><i class="fas fa-lock"></i> Confirm Password:</label>
          <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your password" required>
        </div>
       <div class="button-container">
        <button class="add-button"   type="submit" ><i class="fas fa-user-plus"></i> Signup</button>
        <button class="read-button" @click="goToLogin"><i class="fas fa-sign-in-alt"></i> Login</button>

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

import axios from "axios";
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
      successModal: {show:false, message: ""},
      failureModal: {show:false, message: ""},
      confirmationModal: {show:false, message: ""},

    };
  },
  methods: {
    register() {
      this.loadingModal= true;
      axios
          .post("http://localhost:8080/api/user/register", {
            userName: this.userName,
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNumber: this.phoneNumber,
            email: this.email,
            password: this.password
          })
          .then(response => {
            // Handle success
            console.log("Registration successful");
            console.log(response);
            this.loadingModal = false;
            this.successModal.message = "Registration successful";
            this.successModal.show = true;
          })
          .catch(error => {
            // Handle error
            this.loadingModal= false;
            console.log("An error occurred: registration failed");
            console.log(error);
            this.successModal.show = false;
            this.failureModal.show = true;
            this.failureModal.message = "Registration failed";
          });
    },
    goToLogin() {
      this.$router.push("/login");
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



