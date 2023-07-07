<template>
  <nav class="navbar navbar-expand-sm navbar-custom">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img alt="Logo" class="logo" src="../../assets/OntheGoRentals-Logo-Round-Clear.PNG">
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/nav/user/login" class="nav-link">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/nav/user/signup" class="nav-link">Signup</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin" class="nav-link">Admin Dashboard</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

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
