<template>
  <div class="user-profile">
    <h1>User Profile</h1>
    <div class="profile-details">
      <div>
        <label>Username:</label>
        <span>{{ user.userName }}</span>
      </div>
      <div>
        <label>Email:</label>
        <span>{{ user.email }}</span>
      </div>
      <div>
        <label>First Name:</label>
        <span>{{ user.firstName }}</span>
      </div>
      <div>
        <label>Last Name:</label>
        <span>{{ user.lastName }}</span>
      </div>
      <div>
        <label>Phone Number:</label>
        <span>{{ user.phoneNumber }}</span>
      </div>
      <div>
        <label>Role:</label>
        <span>{{ user.role }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    fetchUserProfile() {
      // Assuming you have the user ID or any other identifier to fetch the user's profile
      const userId = '123'; // Replace with the actual user ID

      axios
          .get(`http://localhost:8080/api/user/${userId}`)
          .then((response) => {
            this.user = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
  },
};
</script>

<style scoped>

</style>
