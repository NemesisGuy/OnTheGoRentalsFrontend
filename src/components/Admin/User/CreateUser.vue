<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form @submit.prevent="addUser">
        <h2 class="form-header">Add User</h2>
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="user.firstName" placeholder="Enter first name" required type="text">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="user.lastName" placeholder="Enter last name" required type="text">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="user.email" placeholder="Enter email" required type="email">
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input id="password" v-model="user.password" placeholder="Enter password" required type="password">
        </div>
        <div class="form-group">
          <label for="role">Role:</label>
          <select id="role" v-model="user.roles[0].roleName" required>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>
        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
        </div>
      </form>
    </div>
    <!-- Add the SuccessModal component -->
    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeModal"
        @close="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
    ></SuccessModal>

    <!-- Add the FailureModal component -->
    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    ></FailureModal>
  </div>
</template>

<script>
import axios from "axios";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";
/*String firstName ;
String lastName ;
String email;
String password ;*/

// Add this line to set a default base URL for your API
// axios.defaults.baseURL = 'http://localhost:8080';

// Add an interceptor for every request
axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
);
export default {
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: [{ roleName: "USER" }], // Updated to match the backend structure
      },
      loadingModal: {
        show: false,
      },
      errorMessage: '',
      showConfirmationModal: false,
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
    addUser() {
      this.loadingModal.show = true;

      console.log("Adding user:", this.user);
      // Send the user data to the backend API or perform any other necessary actions
      const token = localStorage.getItem('token');
      api
          .post("/api/admin/users/create", this.user, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            // Handle success
            console.log(response);
            this.loadingModal.show = false;
            this.successModal.message = "User added successfully";
            this.successModal.show = true;

          })
          .catch((error) => {
            // Handle error
            console.log(error);
            this.loadingModal.show = false;
            this.failModal.message = "Failed to add user. Please try again.";
            this.failModal.show = true;
          });

      // You can access the user object using 'this.user' in this method
      console.log("Adding user:", this.user);

      // Reset the form after adding the user
      this.resetForm();
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },
    resetForm() {
      // Reset the form fields
      this.user = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: ["USER"],

      };
    },
  },
};
</script>

<style scoped>

</style>
