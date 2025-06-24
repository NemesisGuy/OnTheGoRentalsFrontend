<template>
  <nav class="navbar navbar-expand-sm navbar-custom">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img alt="Logo" class="logo" src="../../../assets/Images/Logo/OntheGoRentals-Logo-Round-Clear.PNG" />
      </router-link>

      <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link to="/aboutus/latest" class="nav-link blur-button">About Us</router-link>
          </li>

          <li class="nav-item dropdown">
            <a
                class="nav-link dropdown-toggle blur-button"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
              Help
            </a>
            <div class="dropdown-menu blur-button" aria-labelledby="navbarDropdown">
              <router-link to="/help-center" class="dropdown-item blur-button">Help Center</router-link>
              <router-link to="/faq" class="dropdown-item blur-button">FAQ</router-link>
              <router-link to="/contactUs" class="dropdown-item blur-button">Contact Us</router-link>
            </div>
          </li>

          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/login" class="nav-link blur-button">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/nav/user/signup" class="nav-link blur-button">Signup</router-link>
          </li>
        </ul>

        <div class="nav-item dropdown" v-if="isLoggedIn">
          <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          >
            <img
                v-if="profileImageUrl"
                :src="profileImageUrl"
                alt="User"
                class="rounded-circle"
                style="width: 32px; height: 32px; object-fit: cover;"
            />
            <i v-else class="fas fa-user-circle" style="font-size: 1.5rem;"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <router-link to="/user/profile/profile" class="dropdown-item">User Profile</router-link>
            </li>
            <li>
              <router-link to="/booking" class="dropdown-item">Bookings</router-link>
            </li>
            <li v-if="isAdmin">
              <hr class="dropdown-divider" />
              <router-link to="/admin" class="dropdown-item">Admin Dashboard</router-link>
            </li>
            <li>
              <hr class="dropdown-divider" />
              <a href="#" @click.prevent="handleLogout" class="dropdown-item">Sign Out</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

export default {
  name: "Navbar",
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);
    const profileImageUrl = ref(null);

    const updateAuthStatus = () => {
      const token = localStorage.getItem("accessToken");
      isLoggedIn.value = !!token;

      if (isLoggedIn.value) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            profileImageUrl.value = user.profileImageUrl || null;

            const roles = user.roles || [];
            isAdmin.value = roles.some(
                (role) =>
                    role === "ADMIN" ||
                    role === "SUPERADMIN" ||
                    (typeof role === "object" && role.roleName && (role.roleName === "ADMIN" || role.roleName === "SUPERADMIN"))
            );
          } else {
            profileImageUrl.value = null;
            isAdmin.value = false;
          }
        } catch (err) {
          console.error("Error parsing user from localStorage", err);
          isLoggedIn.value = false;
          profileImageUrl.value = null;
          isAdmin.value = false;
        }
      } else {
        profileImageUrl.value = null;
        isAdmin.value = false;
      }
    };

    const handleLogout = () => {
      api
          .post("/api/v1/auth/logout")
          .catch((e) => console.error("Logout error:", e))
          .finally(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            updateAuthStatus();

            // Dispatch the event so any other component listening can update
            window.dispatchEvent(new CustomEvent("auth-change"));

            // Navigate to login page — no reload!
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

    return {
      isLoggedIn,
      isAdmin,
      profileImageUrl,
      handleLogout,
    };
  },
};
</script>

<style>
.navbar-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

body,
.content {
  margin-top: 60px;
}

.logo {
  height: 40px;
  width: auto;
}
</style>
