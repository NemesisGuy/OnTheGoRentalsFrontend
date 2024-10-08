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
        <ul class="navbar-nav me-auto">
          <!-- Common links available to everyone -->
          <li class="nav-item">
            <router-link to="/aboutus/latest" class="nav-link blur-button">About Us</router-link>
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

          <!-- Show Login/Signup when not logged in -->
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/login" class="nav-link blur-button">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/signup" class="nav-link blur-button">Signup</router-link>
          </li>
        </ul>

        <!-- User icon for logged-in users -->
        <div class="nav-item dropdown" v-if="isLoggedIn">
          <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <router-link to="/user/profile/profile" class="dropdown-item">User Profile</router-link>
            </li>
            <li>
              <router-link to="/Booking" class="dropdown-item">Bookings</router-link>
            </li>
            <li v-if="isAdmin">
              <router-link to="/admin" class="dropdown-item">Admin Dashboard</router-link>
            </li>
            <li>
              <router-link to="/signout" class="dropdown-item">Sign Out</router-link>
            </li>

          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from "axios";
import { ref, watchEffect } from "vue";
import api from "@/api";  // Import necessary functions from Vue 3

export default {
  setup() {
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);

    const checkLoginState = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token;

      if (isLoggedIn.value) {
        // Fetch user profile to get roles
        api
            .get('/api/user/profile/read/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then(response => {
              const roles = response.data.roles || [];
            isAdmin.value = roles.some(role => role.roleName === 'ADMIN' || role.roleName === 'SUPERADMIN');
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
.navbar-custom {
  position: fixed; /* Fixes the navbar at the top */
  top: 0;
  left: 0;
  width: 100%; /* Ensures the navbar spans the full width of the viewport */
  z-index: 1000; /* Ensures the navbar is on top of other content */
  background-color: #fff; /* Set the background color if necessary */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: Add shadow for better visibility */
}

body, .content {
  margin-top: 60px; /* Adjust this based on the height of your navbar */
}
</style>
