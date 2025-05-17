<template>
  <div class="admin-view-container">
    <nav class="admin-view-nav" :class="{'admin-view-nav-expanded': isExpanded}">
      <button @click="toggleSidebar" class="toggle-button">
        <i :class="{'fa fa-chevron-right': isExpanded, 'fa fa-chevron-left': !isExpanded}"></i>
      </button>
      <ul>
        <li class="admin-view-nav-item">
          <i class="fa fa-home"></i> Dashboard
        </li>
        <li class="admin-view-nav-item">
          <i class="fa fa-users"></i> Users
        </li>
        <li class="admin-view-nav-item">
          <i class="fa fa-cog"></i> Settings
        </li>
        <li class="admin-view-nav-item">
          <i class="fa fa-chart-bar"></i> Reports
        </li>
      </ul>
    </nav>
    <div class="admin-view-content" :class="{'admin-view-content-shifted': isExpanded}">
      <h1>Admin Panel</h1>
      <button class="blur-button">Hover Me</button>
      <!-- Content goes here -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isExpanded: false, // Controls the sidebar state
    };
  },
  methods: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
    }
  }
};
</script>

<style>
.admin-view-container {
  display: flex;
}

.admin-view-nav {
  width: 70px; /* Collapsed width */
  height: 100vh; /* Full height */
  background-color: #2c3e50; /* Sidebar background */
  position: fixed; /* Fixes sidebar to the left */
  transition: width 0.3s ease; /* Smooth transition for expanding */
}

.admin-view-nav-expanded {
  width: 250px; /* Expanded width */
}

.toggle-button {
  position: absolute;
  top: 10px;
  right: -30px; /* Positioning for the button outside the sidebar */
  background: #34495e;
  border: none;
  color: #ecf0f1;
  padding: 10px;
  cursor: pointer;
}

.admin-view-nav ul {
  list-style-type: none; /* Removes bullet points */
  padding: 0; /* Removes default padding */
  margin: 0; /* Removes default margin */
}

.admin-view-nav-item {
  padding: 10px 20px; /* Adds padding to items */
  color: #ecf0f1; /* Text color */
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease; /* Hover transition */
}

.admin-view-nav-item:hover {
  background-color: #34495e; /* Change background on hover */
}

.admin-view-content {
  flex-grow: 1;
  padding: 20px;
  margin-left: 70px; /* Default margin when sidebar is collapsed */
  transition: margin-left 0.3s ease; /* Transition when sidebar expands */
}

.admin-view-content-shifted {
  margin-left: 250px; /* Adjust based on expanded sidebar width */
}


.blur-button {
  /* Basic button styles */
  padding: 10px 20px;
  border: 2px solid #3498db; /* Initial border */
  background-color: white;
  color: #3498db;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease; /* Smooth transition */

  /* Initial shadow effect (optional) */
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

/* Hover effect */
.blur-button:hover {
  /* Making the border blur */
  border-color: transparent; /* Hide the solid border */
  box-shadow: 0 0 8px 4px rgba(52, 152, 219, 0.5); /* Blurred border effect */
  filter: blur(0.5px); /* Optional: slight blur to the button */
}

</style>
