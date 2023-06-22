<template>
  <div class="nav"></div>
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
</template>

<style>
.logo {
  width: 50px; /* Adjust the width to your desired size */
  height: auto; /* Maintain aspect ratio */
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
</style>
