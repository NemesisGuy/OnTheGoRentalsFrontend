<template>
  <LoadingModal :show="loadingModal.show" v-if="loadingModal.show"></LoadingModal>
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
        <button class="add-button"   type="submit" ><i class="fas fa-user-plus"></i> Signup</button>
        <button class="read-button" @click="goToLogin"><i class="fas fa-sign-in-alt"></i> Login</button>
      </form>
    </div>
  </div>
  <div class="modal-body">

<!--    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>-->

    <!-- Add the LoadingModal component -->


    <!-- Add the SuccessModal component -->
    <SuccessModal
        key="successModal"
        v-if="successModal.show"
        @close="closeModal"
        @cancel="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
        :show="successModal.show"
        :message="successModal.message"
    ></SuccessModal>

    <!-- Add the FailureModal component -->
    <FailureModal
        key="failModal"
        v-if="failModal.show"
        @close="closeModal"
        @cancel="closeModal"
        :show="failModal.show"
        :message="failModal.message"
    ></FailureModal>
  </div>

</template>

<script>

import axios from "axios";

import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";



export default {
  computed: {
  },
  components: {
    ConfirmationModal,
    SuccessModal,
    FailureModal,
    LoadingModal,
  },
  data() {
    return {
      userName: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      showLoadingModal: false,
      showSuccessModal: false,
      showFailureModal: false,
      successMessage: "",
      failureMessage: "",
      errorMessage: '',
      showConfirmationModal: false,
      loadingModal: {
        show: false,
      },
      successModal: {
        show: false,
        message: ""
      },
      failModal: {
        show: false,
        message: ""
      }
    };
  },
  methods: {
    register() {
      this.showLoadingModal = true;
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
            console.log(response);
            this.showLoadingModal = false;
            this.showSuccessModal = true;
            //this.successMessage = "Registration successful";
            this.successModal.message = "Registration successful";
          })
          .catch(error => {
            // Handle error
            console.log(error);
            this.showLoadingModal = false;
            this.showFailureModal = true;
            this.failureMessage = "Registration failed";
          });
    },
    goToLogin() {
      this.$router.push("/login");
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },
  }
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>



