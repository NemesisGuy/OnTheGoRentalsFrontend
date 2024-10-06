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
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.id">
          <td>{{ driver.id }}</td>
          <td>{{ driver.firstName }}</td>
          <td>{{ driver.lastName }}</td>
          <td>{{ driver.licenseCode }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";

export default {
  name: 'DriverList',
  data() {
    return {
      drivers: [],
      category: '',
      sortColumn: '',
      sortDirection: '',
      LoadingModal,
    };
  },
  components: {
    LoadingModal,
  },
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    fetchDrivers() {
      this.loading = true;
      const category = this.$route.params.category;
      api
          .get(`/api/admin/drivers/${category}`)
          .then((response) => {
            this.drivers = response.data;
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
  },
  computed: {
    sortedDrivers() {
      if (this.sortColumn && this.sortDirection) {
        return this.drivers.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
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
/* Styles for the UserList component */
</style>


<style>

</style>