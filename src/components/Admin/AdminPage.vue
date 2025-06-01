<template>
  <div class="admin-area">
    <div class="sidebar" :class="{ expanded: isExpanded }">

      <div class="sidebar-container">
        <ul>
          <li>
            <!--            <a href="#" @click="toggleSidebar"  class="toggle-button"></a>-->
            <button class="toggle-button" @click="toggleSidebar">

              {{ isExpanded ? 'Collapse' : 'Expand' }}
            </button>
          </li>

          <li>
            <router-link to="/admin/dashboard">
              <i class="fas fa-chart-bar"></i>
              <span class="menu-text" v-show="isExpanded">Dashboard</span>
            </router-link>
          </li>


          <li>
            <router-link to="/admin/StaffDailyOperations">
              <i class="fas fa-chart-bar"></i>
              <span class="menu-text" v-show="isExpanded">Daily Operations</span>
            </router-link>
          </li>


          <li>
            <!--            <button class="button" >-->
            <router-link to="/admin/aboutUs">
              <i class="fa fa-info-circle" aria-hidden="true"></i>
              <span class="menu-text" v-show="isExpanded">About Management </span>
            </router-link>
            <!--            </button>-->
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
            <router-link to="/admin/drivers">
              <i class="fas fa-life-ring"></i>
              <span class="menu-text" v-show="isExpanded">Driver Management</span>
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
          <!--          <li>
                      <router-link to="/rental/return/1">
                        <i class="fas fa-undo"></i>
                        <span class="menu-text" v-show="isExpanded">Rental Return</span>
                      </router-link>
                    </li>-->
        </ul>
      </div>
    </div>
    <div class="admin-content-area" :class="{ expanded: isExpanded }">
      <!-- Main content goes here -->
      <router-view></router-view> <!-- This will load AdminDash or other child routes -->

      <router-view name="adminContent"></router-view>
    </div>
  </div>
</template>

<script>
import AdminDash from "@/components/Admin/AdminDash.vue";

export default {
  name: "AdminPage",
  components: {AdminDash},
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

</style>