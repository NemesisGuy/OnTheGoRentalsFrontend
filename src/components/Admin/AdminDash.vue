<script setup>

import RentalChart from './Charts/RentalChart.vue'
import CarUseChart from './Charts/CarUseChart.vue'
import PieChart from './Charts/PieChart.vue'
import RentalDurations from "@/components/Admin/Charts/RentalDurations.vue";
</script>

<template>
  <div class="content-container">
    <div>
      <h1>Admin Dash</h1>
    </div>

    <div class="graph-container">
      <h1>Rentals Per Day</h1>
      <RentalChart/>
    </div>

    <div class="graph-container">
      <h1>Car Usage </h1>
      <CarUseChart/>
    </div>
    <div class="graph-container">
      <h1>Car Price Groups </h1>
      <PieChart/>
    </div>
    <div class="graph-container">
      <h1>Rental Durations </h1>
      <RentalDurations/>
    </div>


  </div>


</template>

<style scoped>


</style>