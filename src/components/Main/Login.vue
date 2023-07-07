<template>
  <div class="form-container">
    <form @submit="login">
      <div class="form-header">
        <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
      </div>
<!--add autocomplete to username and password-->

      <div class="form-group">
        <label for="username"><i class="fas fa-user"></i> Username</label>
        <input type="text" placeholder="Enter username" v-model="username" id="username">
      </div>

      <div class="form-group">
        <label for="email"><i class="fas fa-envelope"></i> Email</label>
        <input type="email" placeholder="Enter email" v-model="email" id="email">
      </div>

      <div class="form-group">
        <label for="password"><i class="fas fa-lock"></i> Password</label>
        <input type="password" placeholder="Enter password" v-model="password" id="password" autocomplete="current-password">
      </div>

      <button type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
      <button @click="goToSignup"><i class="fas fa-user-plus"></i> Signup</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "Login",
  methods: {
    goToSignup() {
      this.$router.push('/signup');
    },
    login() {
      // Make the API call to /user/login
      axios.post('/api/user/login', {
        username: this.username,
        email: this.email,
        password: this.password
      })
          .then(response => {
            // Handle the response
            console.log(response.data);
          })
          .catch(error => {
            // Handle the error
            console.error(error);
          });
    }
  },
  data() {
    return {
      username: '',
      email: '',
      password: ''
    }
  },
  mounted() {
    console.log('Login mounted');
  }
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
