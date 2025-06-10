<template>
  <nav class="navbar navbar-expand-sm navbar-custom">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img alt="Logo" class="logo" src="../../../assets/Images/Logo/OntheGoRentals-Logo-Round-Clear.PNG">
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <!-- Common links available to everyone -->
          <li class="nav-item">
            <router-link to="/aboutus/latest" class="nav-link blur-button">About Us</router-link>
          </li>

          <!-- Help dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle blur-button" href="#" id="navbarDropdown" role="button"
               data-bs-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">
              Help
            </a>
            <div class="dropdown-menu blur-button" aria-labelledby="navbarDropdown">
              <router-link to="/help-center" class="dropdown-item blur-button">Help Center</router-link>
              <router-link to="/faq" class="dropdown-item blur-button">FAQ</router-link>
              <router-link to="/contactUs" class="dropdown-item blur-button">Contact Us</router-link>
            </div>
          </li>

          <!-- Show Login/Signup when not logged in -->
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/login" class="nav-link blur-button">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/signup" class="nav-link blur-button">Signup</router-link>
          </li>
        </ul>

        <!-- User icon for logged-in users -->
        <!-- Ensure this entire div is correctly positioned by your CSS if me-auto on ul is not enough -->
        <div class="nav-item dropdown" v-if="isLoggedIn">
          <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown"
             aria-expanded="false">
            <i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <!-- Assuming /user/profile/profile is a generic link that works
                   or you have a way to dynamically generate it if it needs an ID -->
              <router-link to="/user/profile/profile" class="dropdown-item">User Profile</router-link>
            </li>
            <li>
<!--     to="/booking/0" is a dirty patche cause of the router SORRY BRO :(        -->
              <router-link to="/booking" class="dropdown-item">Bookings</router-link>
            </li>
            <li v-if="isAdmin"> <!-- Conditional rendering for Admin Dashboard -->
              <hr class="dropdown-divider" v-if="isAdmin"/> <!-- Divider only if admin link is shown -->
              <router-link to="/admin" class="dropdown-item">Admin Dashboard</router-link>
            </li>
            <li>
              <hr class="dropdown-divider">
              <!-- Changed to call a method for logout -->
              <a href="#" @click.prevent="handleLogout" class="dropdown-item">Sign Out</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue"; // watchEffect is imported but not used in the final setup logic.
import { useRouter } from 'vue-router';
import api from "@/api"; // api import is used for logout.

/**
 * @file Navbar.vue
 * @description The main navigation bar for the application, built using Vue 3 Composition API.
 * It displays navigation links dynamically based on the user's authentication status and roles (e.g., admin).
 * Features include links to common pages, a help dropdown, user profile, and logout functionality.
 * The authentication status is reactive to changes triggered by an 'auth-change' window event.
 * @component Navbar
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "Navbar",
  /**
   * The Vue 3 Composition API setup function.
   * Initializes reactive state, lifecycle hooks, and methods for the navbar.
   * @returns {object} Reactive properties and methods exposed to the template.
   * @property {import('vue').Ref<boolean>} isLoggedIn - Reactive ref indicating if the user is logged in.
   * @property {import('vue').Ref<boolean>} isAdmin - Reactive ref indicating if the logged-in user has admin privileges.
   * @property {Function} handleLogout - Method to handle user logout.
   */
  setup() {
    const router = useRouter();
    /**
     * Reactive ref indicating if the user is currently logged in.
     * @type {import('vue').Ref<boolean>}
     */
    const isLoggedIn = ref(false);
    /**
     * Reactive ref indicating if the logged-in user has admin or superadmin roles.
     * @type {import('vue').Ref<boolean>}
     */
    const isAdmin = ref(false);

    /**
     * Updates the `isLoggedIn` and `isAdmin` reactive properties based on
     * authentication data stored in localStorage (accessToken, user roles).
     * Parses user data to check for 'ADMIN' or 'SUPERADMIN' roles.
     * @returns {void}
     */
    const updateAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      isLoggedIn.value = !!accessToken;

      if (isLoggedIn.value) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            const roles = userData.roles || [];

            isAdmin.value = roles.some(role => {
              if (typeof role === 'string') {
                return role === 'ADMIN' || role === 'SUPERADMIN';
              } else if (typeof role === 'object' && role !== null && role.roleName) {
                return role.roleName === 'ADMIN' || role.roleName === 'SUPERADMIN';
              }
              return false;
            });
          } else {
            isAdmin.value = false;
          }
        } catch (e) {
          console.error("Error parsing user data from localStorage for Navbar:", e);
          isLoggedIn.value = false;
          isAdmin.value = false;
        }
      } else {
        isAdmin.value = false;
      }
    };

    /**
     * Called when the component is mounted.
     * Performs an initial authentication status update and sets up a window event listener
     * for 'auth-change' to reactively update status upon login/logout elsewhere in the app.
     */
    onMounted(() => {
      updateAuthStatus();
      window.addEventListener('auth-change', updateAuthStatus);
    });

    /**
     * Called when the component is unmounted.
     * Cleans up the 'auth-change' window event listener.
     */
    onUnmounted(() => {
      window.removeEventListener('auth-change', updateAuthStatus);
    });

    /**
     * Handles the user logout process.
     * Attempts to call the backend logout endpoint. Regardless of API call success,
     * it clears authentication-related items from localStorage, updates reactive state,
     * dispatches an 'auth-change' event, and redirects the user to the login page,
     * finally reloading the window.
     * @async
     * @returns {void}
     */
    const handleLogout = () => {
      api.post('/api/v1/auth/logout') // Assumes API endpoint for logout
          .catch(error => {
            // Log error but proceed with client-side cleanup
            console.error("Logout request failed:", error.response || error.message || error);
          })
          .finally(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            isLoggedIn.value = false;
            isAdmin.value = false;

            // Dispatch event so other parts of the app can react if needed
            window.dispatchEvent(new CustomEvent('auth-change'));

            router.push('/nav/user/login').then(() => {
              // Reload to ensure clean state across the application after logout
              window.location.reload();
            });
          });
    };

    return {
      isLoggedIn,
      isAdmin,
      handleLogout,
    };
  },
};
</script>

<style>
/* Add your custom styles here */
.navbar-custom {
  position: fixed; /* Fixes the navbar at the top */
  top: 0;
  left: 0;
  width: 100%; /* Ensures the navbar spans the full width of the viewport */
  z-index: 1000; /* Ensures the navbar is on top of other content */
  background-color: #fff; /* Set the background color if necessary */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: Add shadow for better visibility */
}

body, .content {
  margin-top: 60px; /* Adjust this based on the height of your navbar */
}

/* Your existing .logo, .nav-link, .blur-button, .dropdown-menu, etc. styles should remain here */
.logo {
  height: 40px;
  width: auto;
}
</style>