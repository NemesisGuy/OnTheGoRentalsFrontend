<template>
  <div>
    <h1>Users Component</h1>
    <router-link to="/admin/users/create" class="add-user-link">
      Add New User
    </router-link>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="Search...">
      <button @click="resetSearch">Reset</button>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortUsers('id')">ID</th>
        <th @click="sortUsers('userName')">Username</th>
        <th @click="sortUsers('email')">Email</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="user in filteredUsers" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.userName }}</td>
        <td>{{ user.email }}</td>
        <td>
          <button @click="deleteUser(user.id)" class="delete-button">Delete</button>
          <button @click="updateUser(user.id)" class="update-button">Update</button>
          <button @click="openUserView(user.id)" class="read-button">Read</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      users: [], // Placeholder for the list of users
      searchQuery: "",
      sortBy: "",
      loading: false,
    };
  },
  computed: {
    sortedUsers() {
      if (this.sortBy) {
        const sorted = [...this.users];
        sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
        return sorted;
      }
      return this.users;
    },
    filteredUsers() {
      const query = this.searchQuery.toLowerCase();
      return this.sortedUsers.filter((user) => {
        for (const key in user) {
          if (typeof user[key] === "string" && user[key].toLowerCase().includes(query)) {
            return true;
          }
        }
        return false;
      });
    },
  },
  methods: {
    fetchUsers() {
      this.loading = true;
      axios
          .get(`http://localhost:8080/api/admin/users/all`)
          .then((response) => {
            this.users = response.data;
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    deleteUser(userId) {
      // Delete a user from the 'users' array
    },
    updateUser(userId) {
      this.$router.push(`/admin/users/edit/${userId}`);
      // Update an existing user in the 'users' array
    },
    openUserView(userId) {
      this.$router.push(`/admin/users/read/${userId}`);
    },
    sortUsers(sortBy) {
      this.sortBy = sortBy;
    },
    resetSearch() {
      this.searchQuery = "";
    },
  },
  created() {
    this.fetchUsers(); // Fetch users when the component is created
  },
};
</script>

<style scoped>
.add-user-link {
  margin-bottom: 1rem;
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

th {
  padding: 0.5rem;
  text-align: left;
}

td {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
}

.delete-button {
  background-color: #e53935;
}

.update-button {
  background-color: #ff9800;
}

.read-button {
  background-color: #2196f3;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  padding: 0.5rem;
  width: 300px;
  margin-right: 1rem;
}

.search-bar button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  background-color: #2196f3;
}

.loading {
  margin-top: 1rem;
}
</style>
