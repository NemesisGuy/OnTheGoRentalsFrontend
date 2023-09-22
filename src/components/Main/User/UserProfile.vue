<template>
  <div class="card-container">
    <div class="form-container">
      <div>
        <div class="form-header">
          <h2><i class="fas fa-user"></i> Welcome to Your Profile</h2>
        </div>
        <hr>
        <div class="profile-info">
          <div class="profile-image">
           <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="Profile Image" class="avatar">
            <img v-else src="@/assets/Images/Defaults/default-user-avatar.png" alt="Placeholder Image" class="avatar">
          </div>
          <hr>
          <p><strong><i class="fas fa-user"></i> Username:</strong> {{ user.userName }}</p>
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>
          <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>
          <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>
          <p><strong><i class="fas fa-phone"></i> Phone Number:</strong> {{ user.phoneNumber }}</p>

          <!-- Add more profile information as needed -->
          <hr>
          <div class="button-container">
            <button @click="editProfile" class="update-button button"><i class="fa fa-pencil"></i> Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: {}
    };
  },

  mounted() {
    // Retrieve user profile information from your backend API
    // You can make an HTTP request to fetch the user data
    // Example using Axios:
    const userId = this.$route.params.id;
    axios.get('http://localhost:8080/api/user/profile/' + userId)
        .then(response => {
          this.user = response.data;
        })
        .catch(error => {
          console.error(error);
        });
  },
  methods: {
    editProfile() {
      // Redirect the user to the edit profile page
      this.$router.push("/edit-profile"); // Adjust the route as per your application structure
    }
  },
};
</script>

<style scoped>
.profile-info {
  margin-top: 20px;
}
.avatar {
  width: 100px; /* Set the desired width */
  height: 100px; /* Set the desired height */
  object-fit: cover; /* Maintain aspect ratio */
}
.profile-image {
  text-align: center;
}


</style>
