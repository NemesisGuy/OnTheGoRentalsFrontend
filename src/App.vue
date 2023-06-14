<template>
  <div class="app">
    <div class="app-container">
      <div>
        <navbar></navbar>
      </div>

      <div>
        <!-- Your content -->
      </div>

      <div>
        <router-view></router-view>
      </div>

<!--      <footer>
        <Footer></Footer>
      </footer>-->
    </div>
  </div>
</template>


<script>

import Navbar from './components/Navbar.vue';
import Footer from "@/components/Footer.vue";

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


</style>