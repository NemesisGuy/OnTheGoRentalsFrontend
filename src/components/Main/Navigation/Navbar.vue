<template>
  <nav class="navbar navbar-expand-sm navbar-custom">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img alt="Logo" class="logo" src="../../../assets/Images/Logo/OntheGoRentals-Logo-Round-Clear.PNG">
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <!-- Show Login/Signup when not logged in -->
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/login" class="nav-link blur-button">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/signup" class="nav-link blur-button">Signup</router-link>
          </li>

          <!-- Common links -->
          <li class="nav-item">
            <router-link to="/aboutus/latest" class="nav-link blur-button">About Us</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <router-link to="/Booking" class="nav-link blur-button">Booking</router-link>
          </li>

          <!-- Admin Dashboard visible only for admin role -->
          <li class="nav-item" v-if="isLoggedIn && isAdmin">
            <router-link to="/admin" class="nav-link blur-button">Admin Dashboard</router-link>
          </li>

          <!-- Help dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle blur-button" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">
              Help
            </a>
            <div class="dropdown-menu blur-button" aria-labelledby="navbarDropdown">
              <router-link to="/help-center" class="dropdown-item blur-button">Help Center</router-link>
              <router-link to="/faq" class="dropdown-item blur-button">FAQ</router-link>
              <router-link to="/contactUs" class="dropdown-item blur-button">Contact Us</router-link>
            </div>
          </li>

          <!-- Show User Profile and Sign Out when logged in -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link to="/user/profile/profile" class="nav-link blur-button">
              <i class="fas fa-user"></i> User Profile
            </router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <router-link to="/signout" class="nav-link blur-button">Sign Out</router-link>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from "axios";
import { ref, watchEffect } from "vue";  // Import necessary functions from Vue 3

export default {
  setup() {
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);

    const checkLoginState = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token;

      if (isLoggedIn.value) {
        // Fetch user profile to get roles
        axios
            .get('http://localhost:8080/api/user/profile/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then(response => {
              const roles = response.data.roles || [];
              isAdmin.value = roles.some(role => role.roleName === 'ADMIN');
            })
            .catch(error => {
              console.error('Error fetching user role:', error);
            });
      }
    };

    watchEffect(() => {
      // This will automatically re-run when `localStorage` is updated
      checkLoginState();
    });

    return { isLoggedIn, isAdmin };
  }
};
</script>

<style>
/* Add your custom styles here */
</style>
