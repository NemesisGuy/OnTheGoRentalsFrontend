<template>
  <div>
    <div class="nav">
      <nav>
        <ul class="nav-list">
          <li>
            <router-link to="/">
              <img alt="Logo" class="logo" src="../../assets/OntheGoRentals-Logo-Round-Clear.PNG">
            </router-link>
          </li>
          <li>
            <router-link to="/nav/user/login">Login</router-link>
          </li>
          <li>
            <router-link to="/nav/user/signup">Signup</router-link>
          </li>
          <li>
            <router-link to="/admin">Admin Dashboard</router-link>
          </li>
        </ul>
      </nav>
    </div>

  </div>
</template>

<style>
.logo {
  width: 50px; /* Adjust the width to your desired size */
  height: auto; /* Maintain aspect ratio */
}

.nav {
  background-color: #f2105e;
  color: floralwhite;
  box-shadow: 0px 0px 5px 0px #000;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
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
