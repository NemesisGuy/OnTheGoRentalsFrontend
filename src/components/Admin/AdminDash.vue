<script setup>

import RentalChart from './RentalChart.vue'
import CarUseChart from './CarUseChart.vue'
</script>

<template>
  <div class="content-container">
    <div >
       <h1>Admin Dash</h1>
    </div>

    <div >
      <h1>Rentals Over Time</h1>
      <RentalChart />
    </div>

    <div>
      <h1>Car Usage </h1>
      <CarUseChart />
    </div>
  </div>


</template>

<style scoped>

</style>