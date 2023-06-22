<template>
  <div class="app">
    <div class="app-container">
      <navbar></navbar>
      <div class="app-content">
        <!-- Your content -->
        <router-view></router-view>
      </div>
      <!--
      <footer>
        <Footer></Footer>
      </footer>
      -->
    </div>
  </div>
</template>



<script>

import Navbar from './components/Main/Navbar.vue';
import Footer from "@/components/Main/Footer.vue";

export default {
    name: 'App',
    components: {
        Navbar,Footer,

    },
    data() {
        return {

        }
    }
}
</script>

<style>

.app-container {
  display: flex; /* Display children in a flex layout */
  flex-direction: column; /* Stack children vertically */
}

.app-content {
  flex: 1; /* Allow the content to take up remaining space */
}


</style>