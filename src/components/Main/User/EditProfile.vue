<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
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

        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Save Changes</button>
          <router-link :to="{ name: 'UserProfile' }" class="update-button button">
            <i class="fas fa-arrow-left"></i> Back to Profile
          </router-link>
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
    ></SuccessModal>

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

axios.defaults.baseURL = 'http://localhost:8080';

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
  components: { LoadingModal, FailureModal, SuccessModal },
  data() {
    return {
      editedUser: {
        id: this.$route.params.id,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: [{ roleName: "USER" }]
      },
      loadingModal: {
        show: false,
      },
      errorMessage: '',
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
    this.loadUserProfile();
  },
  methods: {
    loadUserProfile() {
      this.loading = true;
      const token = localStorage.getItem('token');
      axios.get(`/api/user/profile/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
          .then(response => {
            this.editedUser = {
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              email: response.data.email
            };
            const userData = response.data;
            this.user.id = userData.id;
            this.user.firstName = userData.firstName;
            this.user.lastName = userData.lastName;
            this.user.email = userData.email;
            this.user.password = userData.password;
            this.user.roles = userData.roles;
            this.loading = false;

          })
          .catch(error => {
            console.error('Error retrieving user:', error);
          });
    },
    editUserProfile() {
      this.loadingModal.show = true;

      const token = localStorage.getItem('token');

      if (token) {
        axios.put(`/api/user/profile/update`, {

          id: this.$route.params.id,
          firstName: this.editedUser.firstName,
          lastName: this.editedUser.lastName,
          email: this.editedUser.email,
          roles: [{ roleName: "USER" }]

        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
            .then(response => {
              console.log(response);
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
      } else {
        console.error('Token not found');
      }
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
  },
};
</script>

<style scoped>

</style>




