<template>
  <div>
    <h2>Welcome to Your Profile!</h2>
    <div class="profile-info">
      <p><strong>Username:</strong> {{ user.userName }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>First Name:</strong> {{ user.firstName }}</p>
      <p><strong>Last Name:</strong> {{ user.lastName }}</p>
      <p><strong>Phone Number:</strong> {{ user.phoneNumber }}</p>
      <!-- Add more profile information as needed -->
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
  }
};
</script>

<style scoped>
.profile-info {
  margin-top: 20px;
}
</style>
