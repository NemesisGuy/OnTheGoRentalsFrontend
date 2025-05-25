<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div v-if="user" class="profile-details">
        <div class="form-header">
          <h2><i class="fas fa-user"></i> {{ user.firstName }} {{ user.lastName }}'s Profile</h2>
        </div>
        <hr>
        <div class="profile-image">
          <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="Profile Image" class="avatar">
          <img v-else src="@/assets/Images/Defaults/default-user-avatar.png" alt="Placeholder" class="avatar">
        </div>
        <div>
          <p><strong><i class="fas fa-id-badge"></i> User ID:</strong> {{ user.uuid }}</p>
          <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>
        </div>
        <div>
          <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>
        </div>
        <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>
        <div>
          <p><strong><i class="fa-solid fa-dice"></i> Role:</strong> <span>{{ user.roles }}</span></p>
        </div>

        <!-- Rental History section -->
<!--        <user-rental-history :user-id="user.id" />-->

      </div>
      <div v-else>
        <loading-modal v-if="loading"/>
        Loading user profile...
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import UserRentalHistory from '@/components/Main/User/RentalHistory.vue';

axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
);

export default {
  name: 'UserProfile',
  components: {
    LoadingModal,
    UserRentalHistory,
  },
  data() {
    return {
      user: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    fetchUserProfile() {
      this.loading = true;
      const uuid = this.$route.params.uuid;
      api
          .get(`/api/v1/admin/users/${uuid}`)
          .then((response) => {
            this.user = response.data.data;
            this.loading = false;
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
          });
    },
  },
};
</script>

<style scoped>
</style>
