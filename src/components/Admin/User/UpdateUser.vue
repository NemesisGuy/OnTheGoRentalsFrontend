<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of {{ category }} Users</h1>
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
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in sortedUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>
            <input v-model="user.userName" :disabled="!user.editMode" />
          </td>
          <td>
            <input v-model="user.email" :disabled="!user.editMode" />
          </td>
          <td>
            <input v-model="user.firstName" :disabled="!user.editMode" />
          </td>
          <td>
            <input v-model="user.lastName" :disabled="!user.editMode" />
          </td>
          <td>
            <input v-model="user.phoneNumber" :disabled="!user.editMode" />
          </td>
          <td>
            <select v-model="user.role" :disabled="!user.editMode" required>

              <option value="Guest">Guest</option>
              <option value="User" selected>User</option>
              <option value="Privileged">Privileged</option>
              <option value="Admin">Admin</option>

            </select>

          </td>
          <td>
            <button @click="toggleEditMode(user)" class="btn-small">
              {{ user.editMode ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <button @click="deleteUser(user.id)" class="btn-small">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserUpdate',
  data() {
    return {
      users: [],
      category: '',
      sortColumn: '',
      sortDirection: '',
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      const category = 'all';
      axios
          .get(`http://localhost:8080/api/admin/users/${category}`)
          .then((response) => {
            this.users = response.data.map((user) => ({
              ...user,
              editMode: false,
            }));
            this.category = category;
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
    toggleEditMode(user) {
      if (user.editMode) {
        this.updateUser(user);
      }
      user.editMode = !user.editMode;
    },
    updateUser(user) {
      axios
          .put(`http://localhost:8080/api/admin/users/update/${user.id}`, user)
          .then((response) => {
            console.log(response);
            console.log('User updated');
          })
          .catch((error) => {
            console.log(error);
            console.log('User not updated');
          });
    },
  },
  computed: {
    sortedUsers() {
      let sortedUsers = [...this.users];

      if (this.sortColumn) {
        sortedUsers.sort((a, b) => {
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

      return sortedUsers;
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
