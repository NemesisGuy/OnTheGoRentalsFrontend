<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of Drivers</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortDrivers('id')">ID</th>
          <th @click="sortDrivers('firstName')">First Name</th>
          <th @click="sortDrivers('lastName')">Last Name</th>
          <th @click="sortDrivers('phoneNumber')">License Code</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.id">
          <td>{{ driver.id }}</td>
          <td>{{ driver.firstName }}</td>
          <td>{{ driver.lastName }}</td>
          <td>{{ driver.licenseCode }}</td>
          <td>
            <button @click="deleteDriver(driver.id)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";

export default {
  name: 'DeleteDriver',
  data() {
    return {
      drivers: [],
      sortColumn: '',
      sortDirection: '',
    };
  },
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    fetchDrivers() {
      api
          .get('/api/admin/drivers/get-all')
          .then((response) => {
            this.drivers = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    sortDrivers(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    deleteDriver(id) {
      api
          .delete(`/api/admin/drivers/delete/${id}`)
          .then((response) => {
            this.fetchDrivers();
            console.log(response);
            console.log('Driver deleted');
          })
          .catch((error) => {
            console.log(error);
            console.log('Driver not deleted');
          });
    },
  },
  computed: {
    sortedDrivers() {
      if (this.sortColumn && this.sortDirection) {
        return this.drivers.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          } else {
            return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
        });
      }
      return this.drivers;
    },
  },
};
</script>


<style scoped>
</style>
