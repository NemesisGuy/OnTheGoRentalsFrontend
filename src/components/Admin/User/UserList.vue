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
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
// Add this line to set a default base URL for your API
axios.defaults.baseURL = 'http://localhost:8080';

// Add an interceptor for every request
axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
);
export default {
  name: 'UserList',
  data() {
    return {
      users: [],
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
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      this.loading = true;
      const category = this.$route.params.category;
      axios
          .get(`/api/admin/users/${category}`)
          .then((response) => {
            this.users = response.data;
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
  },
  computed: {
    sortedUsers() {
      if (this.sortColumn && this.sortDirection) {
        return this.users.sort((a, b) => {
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
      return this.users;
    },
  },
};
</script>

<style scoped>
/* Styles for the UserList component */
</style>

<style>
.user {
  border: 1px solid #5e5a5a;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #bd1b1b;
  color: #181818;
}
</style>
