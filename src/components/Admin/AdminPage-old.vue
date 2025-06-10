<template>
  <div class="admin-page">
    <div class="sidebar-container sidebar admin-sidebar">
      <AdminSidebar/>
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

/**
 * @file AdminPage-old.vue
 * @description Defines the main layout for an older version of the admin section.
 * It includes a sidebar (`AdminSidebar`) and a main content area where different
 * admin views are rendered via a named router-view ("adminContent").
 * This component is likely deprecated.
 * @component AdminPageOld
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminPageOld', // Name reflecting the filename
  components: {
    AdminSidebar,
  },
};
</script>

<style>

</style>
