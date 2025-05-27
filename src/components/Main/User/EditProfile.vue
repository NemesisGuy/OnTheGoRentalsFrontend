<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"/>
      <form @submit.prevent="editUserProfile">
        <h2 class="form-header">Edit User Profile</h2>

        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="editedUser.firstName" placeholder="Enter first name" required type="text">
        </div>

        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="editedUser.lastName" placeholder="Enter last name" required type="text">
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="editedUser.email" placeholder="Enter email" required type="email">
        </div>

        <div class="form-group">
          <label for="password">New Password:</label>
          <input id="password" v-model="editedUser.password" placeholder="Enter new password" type="password">
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input id="confirmPassword" v-model="editedUser.confirmPassword" placeholder="Confirm new password"
                 type="password">
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit">
            <i class="fas fa-check"></i> Save Changes
          </button>
          <button class="back-button button" @click="goBack()">
            <i class="fas fa-arrow-left"></i> Back
          </button>
<!--          <router-link :to="{ name: 'UserProfile' }" class="back-button button">
            <i class="fas fa-arrow-left"></i> Back to Profile
          </router-link>-->
        </div>
      </form>
    </div>

    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeModal"
        @close="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
    />

    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    />
  </div>
</template>

<script>
import axios from "axios";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";


export default {
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      editedUser: {
        id: this.$route.params.id,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        roles: [{roleName: "USER"}]
      },
      loadingModal: {show: false},
      successModal: {show: false, message: ""},
      failModal: {show: false, message: ""}
    };
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    loadUserProfile() {
      const token = localStorage.getItem('token');
      api.get(`/api/v1/users/me/profile`)
          .then(response => {
            const user = response.data;
            this.editedUser.id = user.id;
            this.editedUser.firstName = user.firstName;
            this.editedUser.lastName = user.lastName;
            this.editedUser.email = user.email;
          })
          .catch(error => {
            console.error('Error retrieving user:', error);
          });
    },
    editUserProfile() {
      this.loadingModal.show = true;

      if (this.editedUser.password && this.editedUser.password !== this.editedUser.confirmPassword) {
        this.loadingModal.show = false;
        this.failModal.message = "Passwords do not match.";
        this.failModal.show = true;
        return;
      }

      const token = localStorage.getItem('token');

      const userPayload = {
        id: this.editedUser.id,
        firstName: this.editedUser.firstName,
        lastName: this.editedUser.lastName,
        email: this.editedUser.email,
        roles: this.editedUser.roles
      };

      if (this.editedUser.password) {
        userPayload.password = this.editedUser.password;
      }

      api.put(`/api/v1/users/me/profile`, userPayload )
          .then(response => {
            this.loadingModal.show = false;
            this.successModal.message = "Profile updated successfully";
            this.successModal.show = true;
          })
          .catch(error => {
            console.error('Error updating user profile:', error);
            this.loadingModal.show = false;
            this.failModal.message = "Failed to update profile. Please try again.";
            this.failModal.show = true;
          });
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
/* Add your scoped styles here if needed */
</style>
