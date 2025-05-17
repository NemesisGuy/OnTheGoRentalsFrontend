<script setup>

import RentalChart from './Charts/RentalChart.vue'
import CarUseChart from './Charts/CarUseChart.vue'
import PieChart from './Charts/PieChart.vue'
import RentalDurations from "@/components/Admin/Charts/RentalDurations.vue";
import CarPopularityChart from "@/components/Admin/Charts/CarUseChart.vue";
</script>

<template>
  <div class="card-container-wide card-container-admin-wide ">
    <div class="form-container-wide">
      <div class="form-header">
        <h1><i class="fas fa-chart-bar"></i> Admin Dashboard</h1>
      </div>
      <hr>

      <div class="graph-container">
        <h2>Rentals Per Day</h2>
        <RentalChart/>

      </div>
      <hr>

      <div class="graph-container">
        <h2>Car Usage </h2>
        <CarUseChart/>
      </div>
      <hr>

      <div class="graph-container">
        <h2>Car Price Groups Usage </h2>
        <PieChart/>
      </div>
      <hr>

      <div class="graph-container">
        <h2>Rental Durations </h2>
        <RentalDurations/>
      </div>
      <hr>
    </div>
  </div>


</template>

<style scoped>


</style>