<template>
  <div class="app">
    <navbar></navbar>
    <div class="app-container">
      <div class="app-content">
        <!-- Your content -->
        <router-view></router-view>
      </div>

    </div>
  </div>
</template>

<script>
import Navbar from './components/Main/Navbar.vue';
import Footer from "@/components/Main/Footer.vue";

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
