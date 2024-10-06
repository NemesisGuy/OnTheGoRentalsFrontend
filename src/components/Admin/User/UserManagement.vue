<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-users"></i>
        User Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" to="/admin/users/create">
            <i class="fas fa-user"></i> Add User
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortUsers('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('email')">Email <i class="fas fa-sort"></i></th>
        <!-- roles array-->
        <th @click="sortUsers('roles')">Roles <i class="fas fa-sort"></i></th>

        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="user in sortedUsers" :key="user.id">
        <td v-if="!user.editing">{{ user.id }}</td>
        <td v-else>
          <input v-model="user.id" disabled type="text">
        </td>


        <!-- First Name -->
        <td v-if="!user.editing">{{ user.firstName }}</td>
        <td v-else>
          <input v-model="user.firstName" type="text">
        </td>

        <!-- Last Name -->
        <td v-if="!user.editing">{{ user.lastName }}</td>
        <td v-else>
          <input v-model="user.lastName" type="text">
        </td>


        <!-- Email -->
        <td v-if="!user.editing">{{ user.email }}</td>
        <td v-else>
          <input v-model="user.email" type="text">
        </td>
        <td v-if="!user.editing">
        <span v-for="(role, index) in user.roles" :key="index">
          {{ role.roleName }}
         <span v-if="index < user.roles.length - 1">, </span>
        </span>
        </td>
        <td v-else>
          <select v-model="user.roles" multiple required>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </td>

        <!-- Actions -->
        <td>
          <template v-if="!user.editing">
            <button class="delete-button button" @click="deleteUser(user)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="editUser(user)" >
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="openUserView(user.id)">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button class="update-button button" @click="saveUser(user)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="delete-button button" @click="cancelEdit(user)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>

        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelDeleteUser"
        @confirm="confirmDeleteUser"
    >
      <template v-if="userToDeleteId">
        <div>
          <p>Are you sure you want to delete this user?</p>
          <hr>
          <p>User ID: {{ userToDeleteId.id }}</p>
          <p>Username: {{ userToDeleteId.userName }}</p>
          <p>Email: {{ userToDeleteId.email }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show"
                  @cancel="closeModal"
                  @close="closeModal"></SuccessModal>
    <FailureModal v-if="failModal.show" :message="failModal.message" :show="failModal.show" @cancel="closeModal"
                  @close="closeModal"></FailureModal>
  </div>
</template>

<script>
import axios from "axios";
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";
// Add this line to set a default base URL for your API
/*axios.defaults.baseURL = 'http://localhost:8080';*/

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
  name: "UsersManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      users: [],
      sortedUsers: [],
      searchQuery: "",
      loading: false,
      showConfirmationModal: false,
      userToDeleteId: null,
      successModal: {
        show: false,
        message: "",
      },
      failModal: {
        show: false,
        message: "",
      },
    };
  },
  methods: {
    getUsers() {
      this.loading = true;
      const token = localStorage.getItem('token');
      console.log("token", localStorage.getItem('token'))
      api.get('/api/admin/users/list/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
          .then((response) => {
            this.users = response.data;
            this.sortedUsers = response.data;
            this.loading = false;
            console.log("token", localStorage.getItem('token'))
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to fetch users. Please try again.");
            console.log("token", localStorage.getItem('token'))
          });
    },
    sortUsers(sortKey) {
      this.sortedUsers = this.sortedUsers.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1;
        if (a[sortKey] > b[sortKey]) return 1;
        return 0;
      });
    },
    deleteUser(user) {
      this.userToDeleteId = user;
      this.showConfirmationModal = true;
    },
    confirmDeleteUser() {
      if (this.userToDeleteId) {
        const userId = this.userToDeleteId.id;
        this.loading = true;
          const token = localStorage.getItem('token');
          console.log("token", localStorage.getItem('token'))
        api
            .delete(`/api/admin/users/delete/${this.userToDeleteId.id}`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(() => {
              this.showSuccessModal("User deleted successfully.");
              this.getUsers();
            })
            .catch((error) => {
              this.loading = false;
              this.showFailureModal("Failed to delete user. Please try again.");
            });
      }
      this.userToDeleteId = null;
      this.showConfirmationModal = false;
    },
    cancelDeleteUser() {
      this.userToDeleteId = null;
      this.showConfirmationModal = false;
    },
    editUser(user) {
      /*user.editing = true;*/
    //  this.$router.push(`/admin/users/update/${user.id}`);
      this.$router.push({ name: 'updateUser', params: { id: user.id } });
    },
    saveUser(user) {
      user.editing = false;
      this.loading = true;
        const token = localStorage.getItem('token');
        console.log("token", localStorage.getItem('token'))

      // Convert the roles property to an array of objects
     // user.roles = user.roles.map(roleName => ({roleName}));
      // Convert the roles property to an array of role names
      user.roles = user.roles.map(role => role.roleName);
      // roles: [{ roleName: "USER" }], // Updated to match the backend structure

      api
          .put(`api/admin/users/update/${user.id}`, user,{
              headers: {
                  Authorization: `Bearer ${token}`
              }
          })

          .then(() => {
            this.showSuccessModal("User updated successfully.");
            this.getUsers();
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to update user. Please try again.");
              console.log("token", localStorage.getItem('token'))
          });
    },
    cancelEdit(user) {
      user.editing = false;
    },

   /* api
    .get("http://localhost:8080/api/user/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })*/

    openUserView(userId) {
      this.$router.push(`/admin/users/read/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    },
    resetSearch() {
      this.searchQuery = "";
      this.sortedUsers = this.users;
    },
    showSuccessModal(message) {
      this.successModal = {
        show: true,
        message: message,
      };
    },
    showFailureModal(message) {
      this.failModal = {
        show: true,
        message: message,
      };
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) {
        return this.sortedUsers;
      }
      return this.sortedUsers.filter((user) => {
        return (
            user.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.userName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.phoneNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    },
  },
  created() {
    this.getUsers();
  },
};
</script>

