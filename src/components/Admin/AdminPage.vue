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
import AdminDash from "@/components/Admin/AdminDash.vue"; // Note: Likely routed, direct import might be unused here.

/**
 * @file AdminPage.vue
 * @description Provides the main layout structure for the admin section of the application.
 * It features an expandable/collapsible sidebar for navigation to various admin modules
 * and a main content area where admin-specific views are rendered via Vue Router.
 * (Note: The template contains two router-view elements, one default and one named "adminContent",
 * which might imply complex routing scenarios or a potential area for review/simplification.)
 * @component AdminPage
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "AdminPage",
  /**
   * Components registered for use within this component.
   * @type {object}
   * @property {Component} AdminDash - The main admin dashboard component.
   *                                   (Note: This component is registered but likely loaded via
   *                                   the router-view rather than being directly used in this template.)
   */
  components: { AdminDash },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {boolean} isExpanded - Controls the expanded/collapsed state of the sidebar.
   *                                  `false` for collapsed (default), `true` for expanded.
   */
  data() {
    return {
      isExpanded: false // Sidebar starts collapsed
    };
  },
  methods: {
    /**
     * Toggles the `isExpanded` data property, which controls the visibility
     * state (expanded or collapsed) of the admin sidebar.
     * @returns {void}
     */
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
    }
  }
};
</script>

<style>

</style>