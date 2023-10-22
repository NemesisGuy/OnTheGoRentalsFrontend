<template>
  <div class="app">
    <navbar></navbar>
    <div class="app-container">
      <div class="app-content">
        <!-- Your content -->
        <router-view :currencyData="currencyData"></router-view>
      </div>

    </div>
  </div>
</template>

<script>
import Navbar from './components/Main/Navigation/Navbar.vue';
import Footer from "@/components/Main/General/Footer.vue";
/*import { currencySymbol, setCurrencySymbol } from './store/currencyStore';*/
import axios from "axios";
import {currencySymbol} from "@/store/store";

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {
      currencyData: currencySymbol,
    };
  },
  async created() {
    const response = await axios.get('http://localhost:8080/api/settings/read');
    console.log(response.data);
    this.currencyData = response.data;
  },
};
</script>

<style>

</style>
