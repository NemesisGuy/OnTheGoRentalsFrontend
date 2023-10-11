<template>
  <div class="app">
    <navbar></navbar>
    <div class="app-container">
      <div class="app-content">
        <!-- Your content -->
        <router-view></router-view>
      </div>
<!--      <footer>
        <Footer></Footer>
      </footer>-->
    </div>
  </div>
</template>

<script>
import Navbar from './components/Main/Navigation/Navbar.vue';
import Footer from "@/components/Main/General/Footer.vue";

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {};
  },
};
</script>

<style>

</style>
