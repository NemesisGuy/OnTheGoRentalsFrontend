<template>

    <div class="card-container card-container-admin">
      <div class="form-container">
<!--        <h1>User Profile</h1>-->
        <div v-if="user" class="profile-details">
          <div class="form-header">
            <h2><i class="fas fa-user"></i> {{ user.firstName}} {{ user.lastName }}'s Profile</h2>
          </div>
          <hr>
          <div class="profile-image">
            <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="Profile Image" class="avatar">
            <img v-else src="@/assets/Images/Defaults/default-user-avatar.png" alt="Placeholder Image" class="avatar">
          </div>
          <div>
            <p><strong><i class="fas fa-user"></i> Username:</strong> {{ user.username }}</p>
          </div>
          <div>
            <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>
          </div>
          <div>
            <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>
          </div>
<!--
          <p><strong><i class="fas fa-phone"></i> Phone Number:</strong> {{ user.phoneNumber }}</p>
-->
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>

          <div>
            <p><strong><i class="fa-solid fa-dice"></i> Role:</strong><span>{{ user.roles }}</span> </p>

          </div>
        </div>
        <div v-else>
          <loading-modal v-if="loading" />
          Loading user profile...
        </div>
      </div>


  </div>
</template>


<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';

// Add this line to set a default base URL for your API
axios.defaults.baseURL = '';

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
  name: 'UserProfile',
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
      // Assuming you have the user ID or any other identifier to fetch the user's profile
      const userId = this.$route.params.id; // Get the user ID from the route parameter
      const token = localStorage.getItem('token');
      axios
          .get(`/api/admin/users/read/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.user = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
  },
  components: {
    LoadingModal,
  },
};
</script>

<style scoped>
.avatar {
  width: 100px; /* Set the desired width */
  height: 100px; /* Set the desired height */
  object-fit: cover; /* Maintain aspect ratio */
}
.profile-image {
  text-align: center;
}
.profile-info {
  margin-top: 20px;
}

</style>
