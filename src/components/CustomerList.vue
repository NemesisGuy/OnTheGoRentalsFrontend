<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Customers</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortColumn('name')">Name</th>
          <th @click="sortColumn('contactInfo')">Contact Info</th>
          <th @click="sortColumn('borrowingHistory')">Borrowing History</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="customer in sortedCustomers" :key="customer.customerId">
          <td>{{ customer.name }}</td>
          <td>{{ customer.contactInfo }}</td>
          <td>{{ customer.borrowingHistory }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CustomerList',
  data() {
    return {
      customers: [],
      sortColumn: 'name',
      sortDirection: 'asc'
    };
  },
  mounted() {
    this.fetchCustomers();
  },
  computed: {
    sortedCustomers() {
      let sorted = [...this.customers];

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
      this.sortCustomers();
    },
    sortDirection() {
      this.sortCustomers();
    }
  },
  methods: {
    fetchCustomers() {
      axios
          .get('http://localhost:8080/api/customers')
          .then(response => {
            this.customers = response.data;
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
    sortCustomers() {
      // No need to do anything here, the watcher will automatically trigger the computed property
    }
  }
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
