<template>
  <div class="app">

    <div class="app-container">
        <div>
            <navbar></navbar>
        </div>
        <div>


        </div>
        <div class="some-buttons">

            <router-link to="/customers" class="btn btn-primary">
                <div class="button-container">
                    <button class="btn btn-primary">List of Customers</button>
                </div>
            </router-link>
            <router-link to="/cars" class="btn btn-primary">
                <div class="button-container">
                    <button class="btn btn-primary">List of Cars</button>
                </div>
            </router-link>


        
        </div>
        <div>
            <router-view></router-view>
        </div>

    </div>
  </div>
</template>

<script>

import Navbar from './components/Navbar.vue';

export default {
    name: 'App',
    components: {
        Navbar

    },
    data() {
        return {

        }
    }
}
</script>

<style>


</style>