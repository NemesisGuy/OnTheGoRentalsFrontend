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
        <ul class="navbar-nav">
            <li class="nav-item">

                <router-link :to="{ name: 'AboutUs', params: { id: 2 } }"  class="nav-link">About </router-link>
            </li>
          <li class="nav-item">
            <router-link to="/nav/user/login" class="nav-link">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/nav/user/signup" class="nav-link">Signup</router-link>
          </li>

          <li class="nav-item">
            <router-link to="/Booking" class="nav-link">Booking</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin" class="nav-link">Admin Dashboard</router-link>
          </li>

          <!--under development-->
<!--          <li class="nav-item dropdown">-->
<!--            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"-->
<!--               aria-haspopup="true" aria-expanded="false">-->
<!--              Under Development-->
<!--            </a>-->
<!--            <div class="dropdown-menu" aria-labelledby="navbarDropdown">-->
<!--              &lt;!&ndash;User Profile&ndash;&gt;-->
<!--              <router-link to="/user/profile/profile" class="dropdown-item">User Profile</router-link>-->
<!--              <router-link to="/page1" class="dropdown-item">Page 1</router-link>-->
<!--              <router-link to="/page2" class="dropdown-item">Page 2</router-link>-->
<!--              <router-link to="/page3" class="dropdown-item">Page 3</router-link>-->
<!--            </div>-->
<!--          </li>-->
          <!-- help center faq dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">
              Info
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <router-link to="/help-center" class="dropdown-item">Help Center</router-link>
              <router-link to="/faq" class="dropdown-item">Faq</router-link>
              <router-link to="/feedback" class="dropdown-item">Feedback</router-link>

            </div>
          </li>
          <li class="nav-item">
            <router-link to="/contactUs" class="nav-link">Contact Us</router-link>
          </li>
          <li>
            <router-link to="/user/profile/profile" class="nav-link">
              <i class="fas fa-user"></i> User Profile
            </router-link>
          </li>
          <div>
            <li>
              <router-link to="/signout" class="nav-link">Sign Out</router-link>
            </li>
          </div>
        </ul>
      </div>
    </div>

  </nav>
</template>


<style>
.logo {
  width: 50px;
  height: auto;
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
</style>
<script >
</script>