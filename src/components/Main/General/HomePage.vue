<template>

  <div>
    <button @click="goToCars">View Cars</button>
    <button @click="goToCustomers">View Customers</button>
  </div>
</template>

<script>
/**
 * @file HomePage.vue
 * @description A simple component that provides navigation buttons to other parts of the application,
 * specifically to view cars and customers.
 * @component HomePage
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'HomePage',
  methods: {
    /**
     * Navigates the user to the '/cars' route.
     * @returns {void}
     */
    goToCars() {
      this.$router.push('/cars');
    },
    /**
     * Navigates the user to the '/customers' route.
     * @returns {void}
     */
    goToCustomers() {
      this.$router.push('/customers');
    }
  }
}
</script>