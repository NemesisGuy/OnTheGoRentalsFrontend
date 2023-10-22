<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Driver</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortColumn('name')">Name</th>
          <th @click="sortColumn('contactInfo')">Contact Info</th>
          <th @click="sortColumn('borrowingHistory')">Borrowing History</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="driver in sortedDrivers" :key="driver.driverId">
          <td>{{ driver.name }}</td>
          <td>{{ driver.contactInfo }}</td>
          <td>{{ driver.borrowingHistory }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'DriverList',
  data() {
    return {
      drivers: [],
      sortColumn: 'name',
      sortDirection: 'asc'
    };
  },
  mounted() {
    this.fetchDrivers();
  },
  computed: {
    sortedDrivers() {
      let sorted = [...this.drivers];

      sorted.sort((a, b) => {
        const fieldA = a[this.sortColumn].toLowerCase();
        const fieldB = b[this.sortColumn].toLowerCase();

        let comparison = 0;
        if (fieldA > fieldB) {
          comparison = 1;
        } else if (fieldA < fieldB) {
          comparison = -1;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });

      return sorted;
    }
  },
  watch: {
    sortColumn() {
      this.sortDrivers();
    },
    sortDirection() {
      this.sortDrivers();
    }
  },
  methods: {
    fetchDrivers() {
      axios
          .get('http://localhost:8080/api/drivers')
          .then(response => {
            this.drivers = response.data;
          })
          .catch(error => {
            console.log(error);
          });
    },
    sortColumn(column) {
      if (column === this.sortColumn) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    sortDrivers() {
      // No need to do anything here, the watcher will automatically trigger the computed property
    }
  }
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
