<template>
  <nav class="navbar navbar-expand-lg navbar-custom sticky-top">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img alt="Logo" class="logo" src="@/assets/Images/Logo/OntheGoRentals-Logo-Round-Clear.PNG" />
      </router-link>

      <!-- Conditional Toggler Button -->
      <button
          v-if="!isLoggedIn || !profileImageUrl"
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
      >
        <i class="fas fa-bars"></i>
      </button>
      <button
          v-else
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
      >
        <img :src="profileImageUrl" alt="User" class="toggler-avatar" />
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Main Navigation Links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/aboutus/latest" class="nav-link">About Us</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Help
            </a>
            <ul class="dropdown-menu">
              <li><router-link to="/help-center" class="dropdown-item"><i class="fas fa-life-ring"></i> Help Center</router-link></li>
              <li><router-link to="/faq" class="dropdown-item"><i class="fas fa-question-circle"></i> FAQ</router-link></li>
              <li><router-link to="/contactUs" class="dropdown-item"><i class="fas fa-envelope"></i> Contact Us</router-link></li>
            </ul>
          </li>
        </ul>

        <!-- Auth Actions (Right Side) -->
        <div class="navbar-nav">
          <template v-if="!isLoggedIn">
            <div class="auth-buttons">
              <router-link to="/nav/user/login" class="nav-link">Login</router-link>
              <router-link to="/nav/user/signup" class="btn btn-signup">Signup</router-link>
            </div>
          </template>

          <div class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle user-dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="User"
                  class="user-avatar"
              />
              <i v-else class="fas fa-user-circle user-avatar-icon"></i>
              <span>{{ userName || 'My Account' }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><router-link to="/user/profile/profile" class="dropdown-item"><i class="fas fa-user-alt"></i> User Profile</router-link></li>
              <li><router-link to="/my-bookings" class="dropdown-item"><i class="fas fa-calendar-check"></i> My Bookings</router-link></li>
              <li v-if="isAdmin"><hr class="dropdown-divider" /></li>
              <li v-if="isAdmin"><router-link to="/admin" class="dropdown-item admin-link"><i class="fas fa-cogs"></i> Admin Dashboard</router-link></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a href="#" @click.prevent="handleLogout" class="dropdown-item logout-link"><i class="fas fa-sign-out-alt"></i> Sign Out</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();
const isLoggedIn = ref(false);
const isAdmin = ref(false);
const profileImageUrl = ref(null);
const userName = ref('');

const updateAuthStatus = async () => {
  const token = localStorage.getItem("accessToken");
  let user = null;

  if (token) {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("Malformed user object in localStorage. Clearing session.", e);
        user = null; // Ensure user is null if parsing fails
      }
    }

    // A complete user object from the profile endpoint will have firstName and roles.
    // The profileImageUrl property will exist (even if its value is null).
    // An incomplete object (e.g., from login) might be missing these.
    // We check for `undefined` to see if the *key itself* is missing.
    const isUserObjectIncomplete = !user || !user.roles || typeof user.firstName === 'undefined' || typeof user.profileImageUrl === 'undefined';

    if (isUserObjectIncomplete) {
      console.log("Navbar: User data in localStorage is incomplete. Fetching full profile.");
      try {
        const response = await api.get('/api/v1/users/me/profile');
        const fullUserProfile = response.data.data || response.data;

        if (fullUserProfile && fullUserProfile.email) {
          user = fullUserProfile; // Replace whatever we had with the authoritative version.
          localStorage.setItem('user', JSON.stringify(user)); // Update storage for next time.
          console.log("Navbar: Full profile fetched and stored.", user);
        } else {
          console.error("Navbar: /me/profile did not return a valid user. Logging out.");
          user = null;
        }
      } catch (error) {
        console.error("Navbar: Failed to fetch full user profile. Token may be expired. Logging out.", error);
        user = null;
      }
    }
  }

  // --- Final State Update ---
  // Now, update all reactive state based on the final, authoritative `user` object.
  if (user && token) {
    isLoggedIn.value = true;
    profileImageUrl.value = user.profileImageUrl || null; // Will now be correct
    userName.value = user.firstName || user.email || 'My Account';
    // Ensure roles is an array before using .some()
    isAdmin.value = Array.isArray(user.roles) && user.roles.some(role => role === "ADMIN" || role === "SUPERADMIN");
  } else {
    // Not logged in or a critical error occurred. Clean up everything.
    isLoggedIn.value = false;
    profileImageUrl.value = null;
    userName.value = '';
    isAdmin.value = false;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

const handleLogout = () => {
  api.post("/api/v1/auth/logout")
      .catch((e) => console.error("Logout API call failed:", e))
      .finally(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth-change"));
        router.push("/nav/user/login");
      });
};

onMounted(() => {
  updateAuthStatus();
  window.addEventListener("auth-change", updateAuthStatus);
});

onUnmounted(() => {
  window.removeEventListener("auth-change", updateAuthStatus);
});
</script>

<style scoped>
.navbar-custom { background-color: var(--primary-nav-color, #e83e8c); padding: 0.5rem 1rem; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15); }
.logo { height: 45px; width: auto; transition: transform 0.2s ease-in-out; }
.logo:hover { transform: scale(1.1); }
.navbar-toggler { border: 2px solid rgba(255, 255, 255, 0.7); padding: 0.25rem 0.5rem; color: rgba(255, 255, 255, 0.7); }
.navbar-toggler i { font-size: 1.5rem; }
.toggler-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.nav-link { color: rgba(255, 255, 255, 0.85); font-weight: 500; padding: 0.8rem 1rem; border-radius: 8px; transition: background-color 0.2s ease, color 0.2s ease; }
.nav-link:hover { background-color: rgba(255, 255, 255, 0.1); color: white; }
.router-link-active { color: var(--bs-green) !important; font-weight: 800; background-color: var(--bs-gray-300) !important; border-radius: 8px; }
.auth-buttons { display: flex; align-items: center; gap: 0.5rem; }
.btn-signup { background-color: #fff; color: var(--primary-nav-color, #e83e8c); border-radius: 50px; padding: 0.5rem 1.25rem; font-weight: 600; transition: all 0.2s ease-in-out; }
.btn-signup:hover { background-color: #f0f0f0; transform: scale(1.05); }
.user-dropdown-toggle { display: flex; align-items: center; gap: 0.75rem; }
.user-avatar { width: 36px; height: 36px; object-fit: cover; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.5); }
.user-avatar-icon { font-size: 2rem; color: rgba(255, 255, 255, 0.85); }
.dropdown-menu { border-radius: 12px; border: none; box-shadow: 0 5px 25px rgba(0,0,0,0.15); padding: 0.5rem 0; margin-top: 0.5rem !important; }
.dropdown-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; font-weight: 500; color: #343a40; }
.dropdown-item i { width: 20px; text-align: center; color: #6c757d; }
.dropdown-item:hover { background-color: #f8f9fa; color: #007bff; }
.dropdown-item:hover i { color: #007bff; }
.admin-link, .logout-link { color: #dc3545; }
.admin-link i, .logout-link i { color: #dc3545; }
.admin-link:hover, .logout-link:hover { background-color: #f8f9fa; color: #a71d2a; }
.admin-link:hover i, .logout-link:hover i { color: #a71d2a; }
</style>