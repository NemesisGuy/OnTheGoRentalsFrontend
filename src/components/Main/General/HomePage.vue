<template>

  <div>
    <button @click="goToCars">View Cars</button>
    <button @click="goToCustomers">View Customers</button>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    goToCars() {
      this.$router.push('/cars');
    },
    goToCustomers() {
      this.$router.push('/customers');
    }
  }
}
</script>