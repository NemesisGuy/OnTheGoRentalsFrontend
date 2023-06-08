<template>
  <div class="app">

    <div class="app-container">
        <div>
            <navbar></navbar>
        </div>
        <div>


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