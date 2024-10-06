<template>
  <div class="card-container">
    <div class="form-container">
      <div>
        <div class="form-header">
          <h2><i class="fas fa-user"></i> {{ user.firstName }}</h2>
        </div>
        <hr>
        <div class="profile-info">
          <div class="profile-image">
            <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="Profile Image" class="avatar">
            <img v-else src="@/assets/Images/Defaults/default-user-avatar.png" alt="Placeholder Image" class="avatar">
          </div>
          <hr>
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>
          <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>
          <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>
          <hr>
          <div class="button-container">
            <button @click="editProfile" class="update-button button"><i class="fa fa-pencil"></i> Edit Profile</button>
            <button @click="viewRentalHistory"  class="read-button button">
                View Rental History </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api.js'; // Import the API module

export default {
  data() {
    return {
      user: {}
    };
  },

  mounted() {
    const token = localStorage.getItem('token');
    console.log(token);

    if (token) {
      api.get('/api/user/profile/read/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
          .then(response => {
            this.user = response.data;
            console.log(response.data.id); // Logging the user ID
          })
          .catch(error => {
            console.error(error);
          });
    } else {
      console.error('Token not found');
    }
  },

  methods: {
    editProfile() {
      this.$router.push("/edit-profile");
    },
    viewRentalHistory() {
      this.$router.push("/user/profile/rental-history");
    }
  },
};
</script>

<style scoped>

/* Your styles here */
</style>
