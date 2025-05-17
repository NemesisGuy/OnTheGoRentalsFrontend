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
            <button @click="viewRentalHistory" class="read-button button">
              View Rental History
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../../api'; // Your configured Axios instance

export default {
  name: "UserProfile", // It's good practice to name your components
  data() {
    return {
      user: {}, // Initialize as an empty object
      isLoading: true, // Added for loading state
      errorLoading: false, // Added for error state
    };
  },

  async mounted() { // Changed to async for cleaner await
    this.isLoading = true;
    this.errorLoading = false;
    // const accessToken = localStorage.getItem('accessToken'); // Corrected token key
    // console.log("User Profile - Access Token:", accessToken);

    // The Axios interceptor in api.js already handles adding the token.
    // We just need to ensure an accessToken exists to bother making the call.
    if (localStorage.getItem('accessToken')) {
      try {
        // This endpoint should be secured and designed to return the profile
        // of the user authenticated via the Bearer token.
        const response = await api.get('/api/user/profile/read/profile'); // Or the correct endpoint
        this.user = response.data;
        // console.log("User Profile Data:", response.data);
        // console.log("User ID from profile:", response.data.id);
      } catch (error) {
        console.error("Error fetching user profile:", error.response ? error.response.data : error.message);
        this.errorLoading = true;
        // If 401/403 and token refresh fails, the interceptor in api.js should handle logout/redirect.
        // You might want to show a specific message here or let the interceptor do its job.
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Interceptor should handle this, but as a fallback:
          // this.$router.push('/nav/user/login');
        }
      } finally {
        this.isLoading = false;
      }
    } else {
      console.error('User Profile - Access Token not found. User might not be logged in.');
      this.errorLoading = true;
      this.isLoading = false;
      // Redirect to login if no token is found, as profile page requires authentication
      // this.$router.push('/nav/user/login');
    }
  },

  methods: {
    editProfile() {
      // Pass user ID or ensure edit profile page can also fetch current user
      // If your /edit-profile route needs the user ID:
      // if (this.user && this.user.id) {
      //   this.$router.push({ name: 'EditProfile', params: { userId: this.user.id } });
      // } else {
      //   this.$router.push("/edit-profile"); // Fallback or generic edit page
      // }
      this.$router.push("/edit-profile"); // Assuming generic edit page for now
    },
    viewRentalHistory() {
      // Similarly, if rental history needs a user ID and it's part of the route:
      // if (this.user && this.user.id) {
      //   this.$router.push({ name: 'RentalHistory', params: { userId: this.user.id } });
      // } else {
      //  this.$router.push("/user/profile/rental-history");
      // }
      this.$router.push("/user/profile/rental-history"); // Assuming generic page for now
    }
  },
};
</script>

<style scoped>

/* Your styles here */
</style>
