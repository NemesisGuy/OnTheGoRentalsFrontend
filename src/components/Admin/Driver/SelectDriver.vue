<template>
  <div class="driver-selection-container">
    <div class="card driver-list-card">
      <h2>Driver List</h2>
      <input type="text" v-model="searchQuery" placeholder="Search Driver" />
      <ul>
        <li v-for="driver in filteredDrivers" :key="driver.id" @click="selectDriver(driver.id)" :class="{ active: selectedDriverId === driver.id }">
          {{ driver.firstName }}
        </li>
      </ul>
    </div>


    <div class="card driver-details-card">
      <h2>Driver Profile</h2>
      <div v-if="selectedDriver">
        <div>
          <label>First Name:</label>
          <span>{{ selectedDriver.firstName }}</span>
        </div>
        <div>
          <label>Last Name:</label>
          <span>{{ selectedDriver.lastName }}</span>
        </div>
        <div>
          <label>License Code:</label>
          <span>{{ selectedDriver.licenseCode }}</span>
        </div>
      </div>
      <div v-else>
        <p>No driver selected.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";

export default {
  name: 'DriverSelection',
  data() {
    return {
      drivers: [],
      selectedDriverId: '',
      selectedDriver: null,
      searchQuery: '',
    };
  },
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    fetchDrivers() {
      api
          .get('/api/admin/drivers/all')
          .then((response) => {
            this.drivers = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    selectDriver(driverId) {
      this.selectedDriverId = driverId;
      this.selectedDriver = this.drivers.find((driver) => driver.id === this.selectedDriverId);
    },
  },
  computed: {
    filteredDrivers() {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return this.drivers.filter((driver) => driver.firstName.toLowerCase().includes(query));
      }
      return this.drivers;
    },
  },
};
</script>

<style scoped>

</style>
