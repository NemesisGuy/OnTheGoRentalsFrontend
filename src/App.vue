<template>
  <div class="app">
    <navbar></navbar>
    <div class="app-container">
      <div class="app-content">
        <!-- Your content, passing currencyData to the child components -->
        <router-view ></router-view>
<!--
        <router-view :currencyData="currencyData"></router-view>
-->

      </div>
    </div>
<!--    <Footer></Footer>-->
  </div>
</template>

<script>
import Navbar from './components/Main/Navigation/Navbar.vue';
import Footer from "@/components/Main/General/Footer.vue";
/*

import { currencySymbol } from '@/store/store';
import process from "process"; // Assuming currencySymbol is coming from a Vuex store or another global store
*/

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {
/*
      currencyData: currencySymbol, // Set the default value from your store
*/
    };
  },
  async created() {
 /*   try {
      const response = await api.get('/api/settings/read'); // Use your api.js instance here
      console.log(response.data);
      this.currencyData = response.data; // Assign the fetched data to currencyData
    } catch (error) {
      console.error('Error fetching currency data:', error);

    }*/
  },
};
</script>

<style scoped>
/* Add any specific styles here */
</style>
