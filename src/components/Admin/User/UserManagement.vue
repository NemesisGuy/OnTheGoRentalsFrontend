<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-users"></i> User Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button @click="resetSearch" class="reset-search-button">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>


          <router-link class="add-button user-button" to="/admin/users/create">
            <i class="fas fa-user"></i> Add New User
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th @click="sortUsers('id')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortUsers('userName')">Username <i class="fas fa-sort"></i></th>
          <th @click="sortUsers('firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortUsers('lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortUsers('phoneNumber')">Phone Number <i class="fas fa-sort"></i></th>
          <th @click="sortUsers('email')">Email <i class="fas fa-sort"></i></th>
          <th class="actions-column">Actions</th>
        </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="user in sortedUsers" :key="user.id">
        <td v-if="!user.editing">{{ user.id }}</td>
        <td v-else>
          <input v-model="user.id" disabled type="text">
        </td>


        <!-- Username -->
        <td v-if="!user.editing">{{ user.userName }}</td>
        <td v-else>
          <input v-model="user.userName" type="text">
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

        <!-- Phone Number -->
        <td v-if="!user.editing">{{ user.phoneNumber }}</td>
        <td v-else>
          <input v-model="user.phoneNumber" type="text">
        </td>
        <!-- Email -->
        <td v-if="!user.editing">{{ user.email }}</td>
        <td v-else>
          <input v-model="user.email" type="text">
        </td>
        <!-- Actions -->
        <td>
          <template v-if="!user.editing">
            <button class="delete-button" @click="deleteUser(user)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button" @click="editUser(user)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button" @click="openUserView(user.id)">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button class="update-button" @click="saveUser(user)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="delete-button" @click="cancelEdit(user)">
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
    <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show" @cancel="closeModal"
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
      axios
          .get("http://localhost:8080/api/admin/users/list/all")
          .then((response) => {
            this.users = response.data;
            this.sortedUsers = response.data;
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to fetch users. Please try again.");
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
        axios
            .delete(`http://localhost:8080/api/admin/users/delete/${this.userToDeleteId.id}`)
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
      user.editing = true;
    },
    saveUser(user) {
      user.editing = false;
      this.loading = true;
      axios
          .put(`http://localhost:8080/api/admin/users/update/${user.id}`, user)
          .then(() => {
            this.showSuccessModal("User updated successfully.");
            this.getUsers();
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to update user. Please try again.");
          });
    },
    cancelEdit(user) {
      user.editing = false;
    },
    openUserView(userId) {
      this.$router.push(`/admin/users/read/${userId}`);
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
            user.phoneNumber.toLowerCase().includes(this.searchQuery.toLowerCase())||
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

