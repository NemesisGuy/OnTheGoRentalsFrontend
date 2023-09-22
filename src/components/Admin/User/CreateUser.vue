<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <form @submit.prevent="addUser">
        <h2 class="form-header">Add User</h2>
        <div class="form-group">
          <label for="userName">Username:</label>
          <input id="userName" v-model="user.userName" placeholder="Enter username" required type="text">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="user.email" placeholder="Enter email" required type="email">
        </div>
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="user.firstName" placeholder="Enter first name" required type="text">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="user.lastName" placeholder="Enter last name" required type="text">
        </div>
        <div class="form-group">
          <label for="phoneNumber">Phone Number:</label>
          <input id="phoneNumber" v-model="user.phoneNumber" placeholder="Enter phone number" required type="tel">
        </div>
        <div class="form-group">
          <label for="role">Role:</label>
          <select id="role" v-model="user.role" required>
            <option value="Guest">Guest</option>
            <option selected value="User">User</option>
            <option value="Privileged">Privileged</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
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
      console.log("Adding user:", this.user);
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
