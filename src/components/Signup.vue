<template>
  <div class="form-container" @submit.prevent="register">
    <form>
      <h2 class="form-header">Signup</h2>
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="userName" name="userName" placeholder="Enter your username" v-model="userName" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" v-model="password" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" placeholder="Enter your email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm Password:</label>
        <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your password" required>
      </div>
      <button type="submit">Signup</button>

      <button @click="goToLogin">Login</button>

    </form>
  </div>
</template>


<script>
import axios from "axios";

export default {
    data() {
        return {
            userName: '',
            email: '',
            password: ''
        };
    },
    methods: {
        register() {
            // Implement your registration logic here
            // You can make an HTTP request to your backend API to handle the registration process
            // You can use libraries like Axios or fetch to perform the HTTP request
            // Example:
            axios.post('http://localhost:8080/api/user/register', {
               userName: this.userName,
               email: this.email,
               password: this.password
             })
             .then(response => {
               // Handle success
                console.log(response);
             })
             .catch(error => {
               // Handle error
                console.log(error);
             });
        }, goToLogin() {
            this.$router.push('/login');
        }
    }
};
</script>


<style scoped>
/* Add your component-specific styles here */
</style>
