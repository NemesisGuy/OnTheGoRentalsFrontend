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
import { ref, watchEffect, onMounted, onUnmounted } from "vue"; // Added onUnmounted
import { useRouter } from 'vue-router';
import api from "@/api";
// api import is not strictly needed in this version of the navbar if logout doesn't call backend
// but keep it if your handleLogout eventually does.
// import api from "@/api";

export default {
  name: "Navbar", // Good practice to name components
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);
    // Removed userEmail and userId refs as they are not directly used in your provided template
    // If you decide to display user email or need ID for dynamic links, you can re-add them.

    const updateAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      isLoggedIn.value = !!accessToken; // True if accessToken exists, false otherwise

      if (isLoggedIn.value) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            const roles = userData.roles || []; // Default to empty array if not present

            // Corrected isAdmin check
            isAdmin.value = roles.some(role => {
              // Check if roles are stored as simple strings or as objects with a roleName property
              if (typeof role === 'string') {
                return role === 'ADMIN' || role === 'SUPERADMIN';
              } else if (typeof role === 'object' && role !== null && role.roleName) {
                return role.roleName === 'ADMIN' || role.roleName === 'SUPERADMIN';
              }
              return false;
            });
          } else {
            // If no 'user' object in localStorage, assume not admin
            isAdmin.value = false;
          }
        } catch (e) {
          console.error("Error parsing user data from localStorage for Navbar:", e);
          // If parsing fails, treat as not logged in or non-admin for safety
          isLoggedIn.value = false;
          isAdmin.value = false;
        }
      } else {
        // If not logged in, not an admin
        isAdmin.value = false;
      }
      // console.log(`Navbar auth status updated: isLoggedIn=${isLoggedIn.value}, isAdmin=${isAdmin.value}`);
    };

    // Call on mount
    onMounted(() => {
      updateAuthStatus();
      // Listen for a custom event that might be dispatched after login/logout from other components
      window.addEventListener('auth-change', updateAuthStatus);
    });

    // Clean up event listener when component is unmounted
    onUnmounted(() => {
      window.removeEventListener('auth-change', updateAuthStatus);
    });

    // watchEffect is good for reacting to changes in reactive dependencies used *within its callback*.
    // For localStorage changes, which are outside Vue's reactivity system,
    // relying on 'auth-change' event or onMounted/route changes is more direct.
    // If you want to keep watchEffect, ensure it depends on something that *does* change reactively
    // when auth status might change, or it might not re-run as expected for localStorage alone.
    // For simplicity and to directly address localStorage, the event listener is more explicit.
    // watchEffect(() => {
    //   updateAuthStatus();
    // });


    const handleLogout = () => {
      api.post('/api/v1/auth/logout')
          .catch(error => {
            console.error("Logout request failed:", error);
          })
          .finally(() => {
            // Client-side cleanup happens regardless of backend call success

            localStorage.removeItem('accessToken');
            // localStorage.removeItem('refreshToken'); // No longer needed from localStorage
            localStorage.removeItem('user');

            isLoggedIn.value = false;
            isAdmin.value = false;

            window.dispatchEvent(new CustomEvent('auth-change'));

            router.push('/nav/user/login').then(() => {
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