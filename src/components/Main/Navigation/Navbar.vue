<template>
  <nav class="navbar navbar-expand-sm navbar-custom">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img alt="Logo" class="logo" src="../../../assets/Images/Logo/OntheGoRentals-Logo-Round-Clear.PNG">
      </router-link>
      <button aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler"
              data-bs-target="#navbarNav" data-bs-toggle="collapse" type="button">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navbarNav" class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/nav/link/to/about/us">About us</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/nav/user/login">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/nav/user/signup">Signup</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/help-center">Help Center</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/Booking">Booking</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin">Admin Dashboard</router-link>
          </li>

          <!--under development-->
          <li class="nav-item dropdown">
            <a id="navbarDropdown" aria-expanded="false" aria-haspopup="true" class="nav-link dropdown-toggle"
               data-bs-toggle="dropdown"
               href="#" role="button">
              Under Development
            </a>
            <div aria-labelledby="navbarDropdown" class="dropdown-menu">
              <!--User Profile-->
              <router-link class="dropdown-item" to="/user/profile/1">User Profile</router-link>
              <router-link class="dropdown-item" to="/page1">Page 1</router-link>
              <router-link class="dropdown-item" to="/page2">Page 2</router-link>
              <router-link class="dropdown-item" to="/page3">Page 3</router-link>
            </div>
          </li>
          <li class="nav-item nav-logout" v-if="isLoggedIn">
            <button class="btn btn-link nav-link" @click="handleLogout">Log Out</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <confirmation-modal :show="ConfirmationModal.show" @cancel="cancelLogout" @confirm="confirmLogout">
    <template v-if="ConfirmationModal">
      <div>
        <p>Are you sure you want to logout?</p>
        <hr>
        <p><b>Warning!!!</b> This action cannot be undone.</p>
      </div>
    </template>
  </confirmation-modal>
</template>
<script>
import {useRouter} from 'vue-router';
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";

export default {
  name: 'Navbar',
  computed: {
    ConfirmationModal() {
      return ConfirmationModal
    },
    hasToken() {
      return localStorage.getItem('token') !== null;
    },
  },
  components: {
    ConfirmationModal,
  },
  data() {
    return {
      ConfirmationModal: {show: false, message: ""},
      isLoggedIn: localStorage.getItem('token') !== null,

    };
  },
  methods: {
    handleLogout() {
      console.log("Logout clicked");
      this.ConfirmationModal.show = true;
      this.ConfirmationModal.message = "Are you sure you want to logout?";
    },
    confirmLogout() {
      console.log("Logout confirmed");
      this.logout();
      this.ConfirmationModal.show = false;
    },
    cancelLogout() {
      console.log("Logout cancelled");
      this.ConfirmationModal.show = false;

    },
    logout() {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      // For example, if you're using Vue Router:
      const router = useRouter();
      console.log("Token removed from local storage and user logged out : " + localStorage.getItem('token'));
      this.ConfirmationModal.show = false;
    },
  }
}

</script>
<style>
.logo {
  width: 50px; /* Adjust the width to your desired size */
  height: auto; /* Maintain aspect ratio */
}

.navbar-custom {
  background-color: #f2105e;
  color: floralwhite;
  box-shadow: 0px 0px 5px 0px #000;
  padding: 10px;
  margin: 0;

}

.navbar-custom {
  background-color: #f2105e; /* Replace with your custom color */
}

.navbar-custom .navbar-nav .nav-link {
  color: floralwhite; /* Replace with your custom link color */
}

.navbar-custom .navbar-nav .nav-link:hover {
  color: floralwhite; /* Replace with your custom link hover color */
}

.navbar-custom .navbar-brand {
  color: floralwhite; /* Replace with your custom brand color */
}

.nav-list {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  list-style: none;
  padding: 0;
}

.nav-list li {
  margin-right: 10px; /* Adjust the spacing between navigation items */
}

.content {
  padding-top: 80px; /* Add padding to the top to prevent content from going under the navigation */
}

.nav-logout {
  margin-left: auto;
}
</style>
