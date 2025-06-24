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
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/login" class="nav-link blur-button">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/signup" class="nav-link blur-button">Signup</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/aboutus/latest" class="nav-link blur-button">AboutUs</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/Booking" class="nav-link blur-button">Booking</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <router-link to="/admin" class="nav-link blur-button">Admin Dashboard</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle blur-button" href="#" id="navbarDropdown" role="button"
               data-bs-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">
              Help
            </a>
            <div class="dropdown-menu blur-button" aria-labelledby="navbarDropdown">
              <router-link to="/help-center" class="dropdown-item blur-button">Help Center</router-link>
              <router-link to="/faq" class="dropdown-item blur-button">Faq</router-link>
              <router-link to="/contactUs" class="dropdown-item blur-button">Contact Us</router-link>
            </div>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/user/profile/profile" class="nav-link blur-button">
              <i class="fas fa-user"></i> User Profile
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/signout" class="nav-link blur-button">Sign Out</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false
    };
  },
  created() {
    // Check if the JWT token exists in localStorage or sessionStorage
    const token = localStorage.getItem('jwtToken'); // Or use sessionStorage if you prefer
    this.isLoggedIn = !!token; // Convert to a boolean
  }
};
</script>

<style>
/* Add your custom styles here */
</style>
