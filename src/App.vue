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

/**
 * @file App.vue
 * @description The main root component for the OnTheGoRentals application.
 * It sets up the global layout, including a navigation bar and the main content area
 * where different views are rendered by Vue Router.
 * @component App
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'App',
  /**
   * Components registered for use within this component.
   * @type {Object}
   * @property {Component} Navbar - The main navigation bar component.
   */
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
