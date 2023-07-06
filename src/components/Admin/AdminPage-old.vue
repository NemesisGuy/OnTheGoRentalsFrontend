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
.admin-page {

  grid-template-columns: min-content 1fr;
  grid-gap: 20px;
  height: 100vh; /* Set the height of the admin page to fill the viewport */
  width: 60vw; /* Set the width of the admin page to fill the viewport */ ;


}

.sidebar-container {
  /* Add styles for the sidebar container */
/*  thjis must stick left*/
  position: fixed; /* Make it stick, even on scroll */
  top: 0; /* Position it at the top of the viewport */
  left: 0; /* Position it at the left of the viewport */
  height: 100vh; /* Set the height of the sidebar to fill the viewport */
  display: flex;
  flex-direction: column;
  width: min-content; /* Set the width of the sidebar */
  height: 100vh;padding-top: 80px;
  /* Add any additional styles as needed */
  z-index: 1;
}

.main-content {
  /* Add styles for the main content container */
  margin-left: min-content; /* Add margin to the main content to avoid overlap with the sidebar */
  /* Set the width of the main content to fill the remaining space */
  /*width: admin-page.width - sidebar-container.width; !* *!*/

/*  width: calc(admin-page.width - sidebar-container.width);*/

}

/* styles.css */
.main-content {
 /* width: calc(var(--admin-page-width) - var(--sidebar-container-width));*/
  width: 80%;
  /* Add any additional styles as needed */
}

.admin-content-container {
  /* Add styles for the admin content container */
}

/* Rest of your styles */
</style>
