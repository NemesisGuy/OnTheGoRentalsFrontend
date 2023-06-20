<!--Filename : AdminSidebar.vue-->
<template>

  <div class="sidebar admin-sidebar">
    <ul>
      <li>
        <router-link to="/admin/cars">
          Cars
          <ul class="submenu">
            <li><router-link to="/cars/all">List Cars</router-link></li>
<!--            <li><router-link to="/admin/cars/create">Add Car</router-link></li>-->
            <li><router-link to="/admin/cars/select">View Car</router-link></li>
<!--            <li><router-link to="/admin/cars/update">Update Car</router-link></li>
            <li><router-link to="/admin/cars/delete">Delete Car</router-link></li>-->
          </ul>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/users">
          Users
          <ul class="submenu">
            <li><router-link to="/admin/users/all">List Users</router-link></li>
            <li><router-link to="/admin/users/create">Add User</router-link></li>
            <li><router-link to="/admin/users/select">View User</router-link></li>
            <li><router-link to="/admin/users/update">Update User</router-link></li>
            <li><router-link to="/admin/users/delete">Delete User</router-link></li>
          </ul>
        </router-link>
      </li>
      <li><a @click="menuItem7">Item 7</a></li>
      <li><a @click="menuItem8">Item 8</a></li>
      <li><a @click="menuItem9">Item 9</a></li>
      <li><a @click="menuItem10">Item 10</a></li>
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
