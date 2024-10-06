<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form @submit.prevent="updateUser">
        <h2 class="form-header">Update User</h2>
        <h3 class="form-subheader">User ID: {{user.id }}</h3>

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
<!--password-->
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
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Update</button>
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
// Add this line to set a default base URL for your API
/*axios.defaults.baseURL = 'http://localhost:8080';*/

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
        id: this.$route.params.id, // Get the ID from the route params
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: [{ roleName: "USER" }], // Updated to match the backend structure
      },
      loading: false, // Add this line to define the loading state
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
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    updateUser() {
      this.loading = true;
      console.log("Updating user:", this.user);
      // Send the user data to the backend API or perform any other necessary actions
      const token = localStorage.getItem('token');
      api
          .put(`/api/admin/users/update/${this.user.id}`, this.user, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            // Handle success
            console.log(response);
            this.loading = false;
            this.successModal.message = "User updated successfully";
            this.successModal.show = true;
          })
          .catch((error) => {
            // Handle error
            console.log(error);
            this.loading = false;
            this.failModal.message = "Failed to update user. Please try again.";
            this.failModal.show = true;
          });
      //Log  the user after updating their profile
      console.log("Updated user:", this.user);

      // Reset the form after updating the user
      this.resetForm();
    },
    fetchUserProfile() {
      this.loading = true;

      // Assuming you have the user ID or any other identifier to fetch the user's profile
      const userId = this.$route.params.id; // Get the user ID from the route parameter
      const token = localStorage.getItem('token');
      api
          .get(`/api/admin/users/read/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
           // this.user = response.data;
            const userData = response.data;//get all data
            this.user.id = userData.id;//filter data per field
            this.user.firstName = userData.firstName;
            this.user.lastName = userData.lastName;
            this.user.email = userData.email;
            this.user.password = userData.password;
            this.user.roles = userData.roles; // Include user roles
            this.loading = false;


          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
            this.failModal.message = "Failed to fetch user. Please try again.";
            this.failModal.show = true;
          });
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },

    resetForm() {
      // Reset the form fields
      this.user = {
        id: "",
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
