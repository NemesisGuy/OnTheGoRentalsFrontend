<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
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
  </div>
</template>

<script>
import axios from "axios";

export default {


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
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    updateUser() {
      console.log("Updating user:", this.user);
      // Send the user data to the backend API or perform any other necessary actions
      axios
          .put(`http://localhost:8080/api/admin/users/update/${this.user.id}`, this.user)
          .then((response) => {
            // Handle success
            console.log(response);
          })
          .catch((error) => {
            // Handle error
            console.log(error);
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

      axios
          .get(`http://localhost:8080/api/admin/users/read/${userId}`)
          .then((response) => {
            this.user = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
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
