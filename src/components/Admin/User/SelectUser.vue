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
      axios
          .get('http://localhost:8080/api/admin/users/all')
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
.user-selection-container {
  display: flex;
  justify-content: space-between;
}

.card {
  padding: 20px;
  border-radius: 2px;
  background-color: #6610f2;
  width: 45%;
  box-shadow: black 0px 0px 5px 0px;
}

.user-list-card {
  margin: 20px;
}

.user-list-card h2 {
  margin-bottom: 10px;
}

.user-list-card input[type="text"] {
  margin-bottom: 10px;
}

.user-list-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-list-card li {
  cursor: pointer;
  padding: 5px;
  margin-bottom: 5px;
}

.user-list-card li:hover,
.user-list-card li.active {
  background-color: #6610f2;

}
.user-details-card {
  margin: 20px;
  background-color: #6610f2;
}
.user-details-card h2 {
  margin-bottom: 10px;
}

label {
  font-weight: bold;
}

span {
  margin-left: 10px;
}
</style>
