<template>
  <div class="admin-area">
    <div class="sidebar" :class="{ expanded: isExpanded }">
      <button class="toggle-button" @click="toggleSidebar">


        {{ isExpanded ? 'Collapse' : 'Expand' }}
      </button>
      <div class="sidebar-container">
        <ul>
          <li>
            <router-link to="/admin/dashboard">
              <i class="fas fa-chart-bar"></i>
              <span class="menu-text" v-show="isExpanded">Dashboard</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/cars">
              <i class="fas fa-car"></i>
              <span class="menu-text" v-show="isExpanded">Car Management</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/users">
              <i class="fas fa-users"></i>
              <span class="menu-text" v-show="isExpanded">User Management</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/rentals">
              <i class="fas fa-shopping-cart"></i>
              <span class="menu-text" v-show="isExpanded">Rental Management</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/test">
              <i class="fas fa-cogs"></i>
              <span class="menu-text" v-show="isExpanded">Test</span>
            </router-link>
          </li>
          <li>
            <router-link to="/rental/return/1">
              <i class="fas fa-undo"></i>
              <span class="menu-text" v-show="isExpanded">Rental Return</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="admin-content-area" :class="{ expanded: isExpanded }">
      <!-- Main content goes here -->
      <router-view name="adminContent"></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminPage",
  data() {
    return {
      isExpanded: false
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
.admin-area {
  display: flex;
  height: 100vh;
  width: inherit;


}

.sidebar {
  width: 80px;
  background-color: #a90d42 ;
  transition: width 0.3s;
  box-shadow: 0px 0px 5px 0px #000;


}

.sidebar.expanded {
  width: 300px;
  box-shadow: 0px 0px 5px 0px #000;
}

.toggle-button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #6610f2 ;


}

.sidebar-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-container ul li {
  padding: 10px;
}

.admin-content-area {
  flex-grow: 1;
  background-color: #ffffff;
  transition: margin-left 0.3s;
}

.content.expanded {
  margin-left: 10px; /* Adjust this value to match sidebar width */
}

.sidebar-container ul li i {
  margin-right: 10px;
}

.sidebar-container ul li .menu-text {
  display: none;
}

.sidebar.expanded ul li .menu-text {
  display: inline;
}
.toggle-button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #6610f2;
  display: flex;
  justify-content: center;
  align-items: center;
}


</style>
