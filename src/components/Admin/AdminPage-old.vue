<template>
  <div class="admin-page">
    <div class="sidebar-container sidebar admin-sidebar">
      <AdminSidebar />
    </div>
    <div class="main-content">
      <div class="admin-content-container">
        <!-- Content area that gets updated based on the current route -->
        <router-view name="adminContent"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from "./AdminSidebar.vue";
// Import other components here

export default {
  components: {
    AdminSidebar,
    // Other components
  },
};
</script>

<style>

</style>
