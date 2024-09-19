<template>
  <div class="user-selection-container">
    <div class="card user-list-card">
      <h2>User List</h2>
      <input type="text" v-model="searchQuery" placeholder="Search User" />
      <ul>
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user.id)" :class="{ active: selectedUserId === user.id }">
          {{ user.userName }}
        </li>
      </ul>
    </div>

    <div class="card user-details-card">
      <h2>User Profile</h2>
      <div v-if="selectedUser">
        <div>
          <label>Username:</label>
          <span>{{ selectedUser.userName }}</span>
        </div>
        <div>
          <label>Email:</label>
          <span>{{ selectedUser.email }}</span>
        </div>
        <div>
          <label>First Name:</label>
          <span>{{ selectedUser.firstName }}</span>
        </div>
        <div>
          <label>Last Name:</label>
          <span>{{ selectedUser.lastName }}</span>
        </div>
        <div>
          <label>Phone Number:</label>
          <span>{{ selectedUser.phoneNumber }}</span>
        </div>
        <div>
          <label>Role:</label>
          <span>{{ selectedUser.role }}</span>
        </div>
      </div>
      <div v-else>
        <p>No user selected.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
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
  name: 'UserSelection',
  data() {
    return {
      users: [],
      selectedUserId: '',
      selectedUser: null,
      searchQuery: '',
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      const token = localStorage.getItem('token');
      axios
          .get('/api/admin/users/all', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.users = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    selectUser(userId) {
      this.selectedUserId = userId;
      this.selectedUser = this.users.find((user) => user.id === this.selectedUserId);
    },
  },
  computed: {
    filteredUsers() {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return this.users.filter((user) => user.userName.toLowerCase().includes(query));
      }
      return this.users;
    },
  },
};
</script>

<style scoped>

</style>
