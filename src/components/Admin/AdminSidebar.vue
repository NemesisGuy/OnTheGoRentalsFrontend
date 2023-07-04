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
        <router-link to="/admin/rentals">Rental Management</router-link>
      </li>
      <li>
        <router-link to="/admin/test">Test</router-link>
      </li>
      <li>
        <router-link to="/rental/return/1">Rental Return</router-link>
      </li>
    </ul>
  </div>

</template>

<script>
export default {
  methods: {
    menuItem7() {
      // Handle logic for the "Item 7" menu item
    },
    menuItem8() {
      // Handle logic for the "Item 8" menu item
    },
    menuItem9() {
      // Handle logic for the "Item 9" menu item
    },
    menuItem10() {
      // Handle logic for the "Item 10" menu item
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the component */

</style>
