<!--Filename : AdminSidebar.vue-->
<template>

  <!-- Sidebar content goes here -->

  <div class="sidebar-container">
    <ul>
      <li>
        <router-link to="/admin/dashboard">Dashboard</router-link>
      </li>
      <li>
        <router-link to="/admin/cars">Car Management</router-link>
      </li>
      <li>
        <router-link to="/admin/users">User Management</router-link>
      </li>
      <li>
        <router-link to="/admin/drivers">Driver Management</router-link>
      </li>
      <li>
        <router-link to="/admin/rentals">Rental Management</router-link>
      </li>
      <li>
        <router-link to="/admin/settings">Settings</router-link>
      </li>
      <li>
        <router-link to="/admin/test">Test</router-link>
      </li>
      <li>
        <router-link to="/rental/return/">Rental Return</router-link>
      </li>
    </ul>
  </div>
  <div class="sidebar-container">
    <ul>
      <li>
        <router-link to="/admin/dashboard">Dashboard</router-link>
      </li>
      <li>
        <router-link to="/admin/cars">Car Management</router-link>
      </li>
      <li>
        <router-link to="/admin/users">User Management</router-link>
      </li>
      <li>
        <router-link to="/admin/rentals">Rental Management</router-link>
      </li>
      <li>
        <router-link to="/admin/settings">Settings</router-link>
      </li>
      <li>
        <router-link to="/admin/bookings">Booking Management</router-link>
      </li>
      <li>
        <router-link to="/admin/test">Test</router-link>
      </li>
      <li>
        <router-link to="/rental/return/">Rental Return</router-link>
      </li>
    </ul>
  </div>


</template>

<script>
/**
 * @file AdminSidebar.vue
 * @description Provides a sidebar navigation menu for the admin section of the application.
 * It contains links to various admin modules like Dashboard, Car Management, User Management, etc.
 * (Note: The template currently contains a duplicated list of navigation links, which should likely be consolidated.)
 * @component AdminSidebar
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminSidebar',
  methods: {
    // Unused methods menuItem7, menuItem8, menuItem9, menuItem10 have been removed.
  },
};
</script>

<style scoped>
/* Add custom styles for the component */

</style>
