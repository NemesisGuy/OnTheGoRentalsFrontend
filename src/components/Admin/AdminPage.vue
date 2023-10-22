<template>
  <div class="admin-area">
    <div class="sidebar" :class="{ expanded: isExpanded }">
      <button class="toggle-button" @click="toggleSidebar">


        {{ isExpanded ? 'Collapse' : 'Expand' }}
      </button>
      <div class="sidebar-container">
        <ul>
            <li>
                <router-link to="/admin/aboutUs">
                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                    <span class="menu-text" v-show="isExpanded">About Management </span>
                </router-link>
            </li>
          <li>
            <router-link to="/admin/dashboard">
              <i class="fas fa-chart-bar"></i>
              <span class="menu-text" v-show="isExpanded">Dashboard</span>
            </router-link>
          </li>
            <li>
                <router-link to="/admin/damageReport">
                    <i class="fa fa-book" aria-hidden="true"></i>
                    <span class="menu-text" v-show="isExpanded">Damage Report Management </span>
                </router-link>
            </li>
          <li>
            <router-link to="/admin/cars">
              <i class="fas fa-car"></i>
              <span class="menu-text" v-show="isExpanded">Car Management</span>
            </router-link>
          </li>
            <li>
                <router-link to="/admin/contactUs">
                    <i class="fas fa-envelope"></i>
                    <span class="menu-text" v-show="isExpanded"> Contact Us Management </span>
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
            <router-link to="/admin/faq">
              <i class="fas fa-question-circle"></i>
              <span class="menu-text" v-show="isExpanded">FAQ Management</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/help-center">
              <i class="fas fa-life-ring"></i>
              <span class="menu-text" v-show="isExpanded">Help Center</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/bookings">
  <i class="fas fa-calendar"></i>
  <span class="menu-text" v-show="isExpanded">Booking Management</span>
</router-link>

  </li>

          <li>
            <router-link to="/admin/settings">
              <i class="fas fa-gear"></i>
              <span class="menu-text" v-show="isExpanded">Settings</span>
            </router-link>
          </li>
          <li>
            <router-link to="/admin/test">
              <i class="fas fa-flask"></i>
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
  height: auto;/* Set height to 100% */
  min-height: 100vh;
  width: 100%; /* Set width to 100% */
}
.content-container {
  min-height: 100vh;
}

.sidebar {
  width: 80px;
  background-color: #a90d42;
  transition: width 0.3s;
  box-shadow: 0px 0px 5px 0px #000;
}

.sidebar.expanded {
  width: 250px;
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

.sidebar-container {
  flex: 1; 
  overflow-y: auto; 
}

.admin-content-area {
  flex: 3; 

  transition: margin-left 0.3s;
  overflow-y: auto; 
  overflow-x: auto; 



}

.sidebar-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-container ul li {
  padding: 10px;
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
</style>