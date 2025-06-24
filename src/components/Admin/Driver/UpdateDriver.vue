<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of {{ category }} Drivers</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortDrivers('id')">ID</th>
          <th @click="sortDrivers('firstName')">First Name</th>
          <th @click="sortDrivers('lastName')">Last Name</th>
          <th @click="sortDrivers('licenseCode')">License Code</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.id">
          <td>{{ driver.id }}</td>
          <td>
            <input v-model="driver.firstName" :disabled="!driver.editMode"/>
          </td>
          <td>
            <input v-model="driver.lastName" :disabled="driver.editMode"/>
          </td>
          <td>
            <input v-model="driver.licenseCode" :disabled="!driver.editMode"/>
          </td>
          <td>
            <button @click="toggleEditMode(driver)" class="btn-small">
              {{ driver.editMode ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <button @click="deleteDriver(driver.id)" class="btn-small">Delete</button>
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
  name: 'DriverUpdate',
  data() {
    return {
      drivers: [],
      category: '',
      sortColumn: '',
      sortDirection: '',
    };
  },
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    fetchDrivers() {
      const category = 'all';
      axios
          .get(`http://localhost:8080/api/admin/drivers/${category}`)
          .then((response) => {
            this.drivers = response.data.map((driver) => ({
              ...driver,
              editMode: false,
            }));
            this.category = category;
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
    toggleEditMode(driver) {
      if (driver.editMode) {
        this.updateDriver(driver);
      }
      driver.editMode = !driver.editMode;
    },
    updateDriver(driver) {
      api
          .put(`/api/admin/drivers/update/${driver.id}`, driver)
          .then((response) => {
            console.log(response);
            console.log('Driver updated');
          })
          .catch((error) => {
            console.log(error);
            console.log('Driver not updated');
          });
    },
  },
  computed: {
    sortedDrivers() {
      let sortedDrivers = [...this.drivers];

      if (this.sortColumn) {
        sortedDrivers.sort((a, b) => {
          let valueA = a[this.sortColumn];
          let valueB = b[this.sortColumn];

          if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }

          if (valueA < valueB) {
            return this.sortDirection === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return this.sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }


      return sortedDrivers;
    },
  },
};
</script>

<style scoped>
</style>
