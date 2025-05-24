<!-- App.vue -->
<template>
  <div class="app">
    <Navbar />
    <div class="app-container">
      <div class="app-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Main/Navigation/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar
  }
};
</script>

<style scoped>
/* Global adjustments for layout */

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container {
  flex: 1;

  /*
  padding: 1rem;
  */

}

.app-content {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}
</style>
