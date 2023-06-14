<template>
  <div class="add-user-form form">
    <form @submit.prevent="addUser">
      <h2 class="form-header">Add User</h2>
      <div class="form-group">
        <label for="userName">Username:</label>
        <input type="text" id="userName" v-model="user.userName" required placeholder="Enter username">
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="user.email" required placeholder="Enter email">
      </div>
      <div class="form-group">
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="user.firstName" required placeholder="Enter first name">
      </div>
      <div class="form-group">
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="user.lastName" required placeholder="Enter last name">
      </div>
      <div class="form-group">
        <label for="phoneNumber">Phone Number:</label>
        <input type="tel" id="phoneNumber" v-model="user.phoneNumber" required placeholder="Enter phone number">
      </div>
      <div class="form-group">
        <label for="role">Role:</label>
        <select id="role" v-model="user.role" required>
          <option value="Guest">Guest</option>
          <option value="User" selected>User</option>
          <option value="Privileged">Privileged</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <button type="submit">Add User</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: {
        userName: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "User",
      },
    };
  },
  methods: {
    addUser() {
      // Send the user data to the backend API or perform any other necessary actions
      axios
          .post("http://localhost:8080/api/admin/users/create", this.user)
          .then((response) => {
            // Handle success
            console.log(response);
          })
          .catch((error) => {
            // Handle error
            console.log(error);
          });

      // You can access the user object using 'this.user' in this method
      console.log("Adding user:", this.user);

      // Reset the form after adding the user
      this.resetForm();
    },
    resetForm() {
      // Reset the form fields
      this.user = {
        userName: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "User",
      };
    },
  },
};
</script>

<style scoped>

</style>
