<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of Users</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortUsers('id')">ID</th>
          <th @click="sortUsers('userName')">Username</th>
          <th @click="sortUsers('email')">Email</th>
          <th @click="sortUsers('firstName')">First Name</th>
          <th @click="sortUsers('lastName')">Last Name</th>
          <th @click="sortUsers('phoneNumber')">Phone Number</th>
          <th @click="sortUsers('role')">Role</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in sortedUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.phoneNumber }}</td>
          <td>{{ user.role }}</td>
          <td><button @click="deleteUser(user.id)">Delete</button></td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeleteUser',
  data() {
    return {
      users: [],
      sortColumn: '', // Current column to sort by
      sortDirection: '', // Current sort direction
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      axios
          .get('http://localhost:8080/api/admin/users/all')
          .then((response) => {
            this.users = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    sortUsers(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    deleteUser(userId) {
      axios
          .delete(`http://localhost:8080/api/admin/users/delete/${userId}`)
          .then((response) => {
            this.fetchUsers();
            console.log(response);
            console.log('User deleted');
          })
          .catch((error) => {
            console.log(error);
            console.log('User not deleted');
          });
    },
  },
  computed: {
    sortedUsers() {
      if (this.sortColumn && this.sortDirection) {
        return this.users.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          } else {
            return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
        });
      }
      return this.users;
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
