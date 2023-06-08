<template>
    <div class="content-container">
      <div class="card-container">
        <h1>Customers</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Borrowing History</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in customers" :key="customer.customerId">
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
        customers: []
      };
    },
    mounted() {
      this.fetchCustomers();
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
      }
    }
  };
  </script>