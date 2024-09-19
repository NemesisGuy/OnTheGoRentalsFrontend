<template>
  <div class="app">
    <!-- Pass a key to force Navbar to reload when login status changes -->
    <navbar :key="navbarKey"></navbar>
    <div class="app-container">
      <div class="app-content">
        <!-- Your content -->
        <router-view :currencyData="currencyData"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Main/Navigation/Navbar.vue';
import axios from "axios";

export default {
  name: 'App',
  components: {
    Navbar,
  },
  data() {
    return {
      currencyData: null,
      navbarKey: 0, // Key to force Navbar re-render
    };
  },
  async created() {
    const response = await axios.get('http://localhost:8080/api/settings/read');
    this.currencyData = response.data;

    // Trigger a re-render when login status changes
    const token = localStorage.getItem('token');
    this.updateNavbar(token);
  },
  methods: {
    updateNavbar(token) {
      // Check for token presence and update navbarKey
      this.navbarKey++; // Increment to force re-render
    },
  },
  watch: {
    // Watch localStorage changes for login status
    '$route': {
      handler() {
        const token = localStorage.getItem('token');
        this.updateNavbar(token); // Check if user is logged in and update Navbar
      },
      immediate: true
    }
  },
};
</script>

<style>
/* Add your custom styles here */
</style>
