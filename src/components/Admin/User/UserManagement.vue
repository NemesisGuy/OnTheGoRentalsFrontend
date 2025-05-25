<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-users-cog"></i> User Management</h1> <!-- Changed icon -->
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" @input="applySearchFilter" placeholder="Search by Name, Email, UUID..." type="text"/>
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-times"></i> Reset <!-- Changed icon -->
            </button>
          </div>
          <router-link class="add-button button" :to="{ name: 'CreateUser' }"> <!-- Use named route -->
            <i class="fas fa-user-plus"></i> Add User
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <LoadingModal :show="true" message="Fetching users..." />
    </div>

    <div v-if="!loading && usersToDisplay.length === 0 && !apiError" class="no-data-message">
      No users found matching your criteria.
    </div>
    <div v-if="apiError && !loading" class="no-data-message error-text">
      {{ failModal.message || "Failed to load users." }}
    </div>


    <table v-if="!loading && usersToDisplay.length > 0">
      <thead>
      <tr>
        <!-- Removed sort for UUID as it's less common to sort by it visually -->
        <th>UUID </th>
        <th @click="sortUsers('firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('email')">Email <i class="fas fa-sort"></i></th>
        <th>Roles <i @click="sortUsers('roles')" class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in usersToDisplay" :key="user.uuid">
        <td>{{ user.uuid ? user.uuid.substring(0, 8) + '...' : 'N/A' }}</td>

        <!-- First Name -->
        <td v-if="!user.editing">{{ user.firstName }}</td>
        <td v-else><input v-model="user.editable.firstName" type="text" class="form-control-inline"></td>

        <!-- Last Name -->
        <td v-if="!user.editing">{{ user.lastName }}</td>
        <td v-else><input v-model="user.editable.lastName" type="text" class="form-control-inline"></td>

        <!-- Email -->
        <td v-if="!user.editing">{{ user.email }}</td>
        <td v-else><input v-model="user.editable.email" type="email" class="form-control-inline"></td>

        <!-- Roles -->
        <td v-if="!user.editing">
          <span v-for="(role, index) in user.roles" :key="index">
            {{ role }}<span v-if="index < user.roles.length - 1">, </span>
          </span>
        </td>
        <td v-else>
          <!-- For simplicity, assuming roles are an array of strings.
               For multi-select, you'd need a more complex component or handling.
               Here, we'll just display and not make them directly editable in-line for roles,
               as role assignment often involves fetching available roles.
               Better to edit roles on a dedicated edit page. -->
          <input v-model="user.editable.rolesString" type="text" class="form-control-inline" placeholder="e.g., USER,ADMIN">
          <!-- <select v-model="user.editable.roles" multiple required class="form-control-inline-select">
            <option v-for="roleOption in availableRoles" :key="roleOption.name" :value="roleOption.name">
                {{ roleOption.name }}
            </option>
          </select> -->
        </td>

        <!-- Actions -->
        <td class="actions-cell">
          <template v-if="!user.editing">
            <button class="button read-button" @click="viewUser(user.uuid)">
              <i class="fas fa-eye"></i>
               View
            </button>
            <button class="button update-button" @click="startEditUser(user)">
              <i class="fas fa-edit"></i>
               Edit
            </button>
            <button class="button delete-button" @click="initiateDeleteUser(user)">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </template>
          <template v-else>
            <button class="button save-button" @click="confirmSaveUser(user)">
              <i class="fas fa-save"></i>
              Save
            </button>
            <button class="button cancel-button" @click="cancelEdit(user)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <div class="modal-body-container">
    <ConfirmationModal
        key="userDeleteConfirmModal"
        :show="showDeleteConfirmationModal"
        title="Confirm User Deletion"
        @cancel="cancelDeleteUser"
        @confirm="executeDeleteUser"
    >
      <template #default v-if="userToDelete">
        <p>Are you sure you want to soft-delete this user?</p>
        <hr>
        <p><strong>UUID:</strong> {{ userToDelete.uuid }}</p>
        <p><strong>Name:</strong> {{ userToDelete.firstName }} {{ userToDelete.lastName }}</p>
        <p><strong>Email:</strong> {{ userToDelete.email }}</p>
        <hr>
        <p><b>Warning:</b> This will mark the user as deleted.</p>
      </template>
    </ConfirmationModal>

    <ConfirmationModal
        key="userSaveConfirmModal"
        :show="showSaveConfirmationModal"
        title="Confirm User Update"
        @cancel="cancelSaveUser"
        @confirm="executeSaveUser"
    >
      <template #default v-if="userToSave && userToSave.editable">
        <p>Are you sure you want to save these changes for user {{userToSave.firstName}} {{userToSave.lastName}}?</p>
        <hr>
        <p><strong>First Name:</strong> {{ userToSave.editable.firstName }}</p>
        <p><strong>Last Name:</strong> {{ userToSave.editable.lastName }}</p>
        <p><strong>Email:</strong> {{ userToSave.editable.email }}</p>
        <p><strong>Roles:</strong> {{ userToSave.editable.rolesString }}</p>
        <!-- Add password change warning if applicable -->
        <p v-if="userToSave.editable.password && userToSave.editable.password.length > 0" class="text-warning">
          <b>Note:</b> Password will be changed if a new value is provided.
        </p>
      </template>
    </ConfirmationModal>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeSuccessModal"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFailModal"/>
  </div>
</template>

<script>
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

// Removed duplicate Axios interceptor setup, assuming it's globally in api.js

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
      allUsers: [], // Original list fetched from API
      usersToDisplay: [], // Filtered/sorted list for display
      searchQuery: "",
      loading: false,
      apiError: false, // To track if API fetch failed
      showDeleteConfirmationModal: false,
      showSaveConfirmationModal: false,
      userToDelete: null,
      userToSave: null, // For storing user being edited before save confirmation
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'lastName',
      currentSortDirection: 'asc',
      // availableRoles: [], // To be fetched if using a select dropdown for roles
    };
  },
  methods: {
    async getUsers() {
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false;
      try {
        const response = await api.get('/api/v1/admin/users'); // Endpoint from AdminUserController
        if (response.data && response.data.status === "success") {
          this.allUsers = (response.data.data || []).map(user => ({
            ...user,
            editing: false,
            editable: null // To store temporary edit values
          }));
          this.applySearchAndSort(); // Initial display
        } else {
          this.handleApiResponseError(response.data, "Failed to fetch users list.");
          this.apiError = true;
        }
      } catch (error) {
        this.handleApiCatchError(error, "Failed to fetch users. Please try again.");
        this.apiError = true;
      } finally {
        this.loading = false;
      }
    },
    applySearchAndSort() {
      let filtered = this.allUsers;
      if (this.searchQuery) {
        const lowerQuery = this.searchQuery.toLowerCase();
        filtered = this.allUsers.filter(user =>
            (user.firstName?.toLowerCase().includes(lowerQuery)) ||
            (user.lastName?.toLowerCase().includes(lowerQuery)) ||
            (user.email?.toLowerCase().includes(lowerQuery)) ||
            (user.uuid?.toLowerCase().includes(lowerQuery)) ||
            (user.roles?.join(', ').toLowerCase().includes(lowerQuery))
        );
      }

      if (this.currentSortColumn) {
        filtered.sort((a, b) => {
          let valA = a[this.currentSortColumn];
          let valB = b[this.currentSortColumn];

          if (this.currentSortColumn === 'roles') { // Special handling for roles array
            valA = valA?.join(', ');
            valB = valB?.join(', ');
          }

          if (valA == null) valA = ''; // Handle null/undefined for sorting
          if (valB == null) valB = '';

          let comparison = 0;
          if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB);
          } else if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
          } else {
            comparison = String(valA).localeCompare(String(valB));
          }
          return this.currentSortDirection === 'asc' ? comparison : -comparison;
        });
      }
      this.usersToDisplay = filtered;
    },
    sortUsers(sortKey) {
      if (this.currentSortColumn === sortKey) {
        this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSortColumn = sortKey;
        this.currentSortDirection = 'asc';
      }
      this.applySearchAndSort();
    },
    resetSearch() {
      this.searchQuery = "";
      this.applySearchAndSort();
    },
    initiateDeleteUser(user) {
      this.userToDelete = user;
      this.showDeleteConfirmationModal = true;
    },
    async executeDeleteUser() {
      if (this.userToDelete && this.userToDelete.uuid) {
        this.loading = true;
        this.showDeleteConfirmationModal = false;
        try {
          await api.delete(`/api/v1/admin/users/${this.userToDelete.uuid}`);
          this.showSuccessModal("User soft-deleted successfully.");
          await this.getUsers(); // Refresh list
        } catch (error) {
          this.handleApiCatchError(error, "Failed to delete user.");
        } finally {
          this.loading = false;
          this.userToDelete = null;
        }
      }
    },
    cancelDeleteUser() {
      this.userToDelete = null;
      this.showDeleteConfirmationModal = false;
    },
    startEditUser(user) {
      // Create a deep copy for editing to avoid mutating original until save
      user.editable = JSON.parse(JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: [...user.roles], // Copy roles array
        rolesString: user.roles.join(','), // For easier editing in a text input
        password: '', // Start with empty password field for update
        // Include other fields an admin can edit from UserUpdateDTO
        authProvider: user.authProvider,
        googleId: user.googleId,
        profileImageUrl: user.profileImageUrl,
        deleted: user.deleted
      }));
      user.editing = true;
    },
    confirmSaveUser(user) {
      this.userToSave = user; // Store the user whose 'editable' state will be saved
      this.showSaveConfirmationModal = true;
    },
    cancelSaveUser() {
      this.userToSave = null;
      this.showSaveConfirmationModal = false;
    },
    async executeSaveUser() {
      if (!this.userToSave || !this.userToSave.editable) return;
      this.showSaveConfirmationModal = false;
      this.loading = true;

      const userToUpdate = this.userToSave; // User whose 'editable' data we are sending
      const updatePayload = {
        firstName: userToUpdate.editable.firstName,
        lastName: userToUpdate.editable.lastName,
        email: userToUpdate.editable.email,
        // Convert comma-separated string back to array of strings for roles
        roleNames: userToUpdate.editable.rolesString ? userToUpdate.editable.rolesString.split(',').map(r => r.trim()).filter(r => r) : [],
        authProvider: userToUpdate.editable.authProvider, // If editable
        googleId: userToUpdate.editable.googleId,
        profileImageUrl: userToUpdate.editable.profileImageUrl,
        deleted: userToUpdate.editable.deleted,
        // Only include password if it's been changed (not empty)
      };
      if (userToUpdate.editable.password && userToUpdate.editable.password.trim() !== "") {
        updatePayload.password = userToUpdate.editable.password;
      }

      try {
        await api.put(`/api/v1/admin/users/${userToUpdate.uuid}`, updatePayload);
        this.showSuccessModal("User updated successfully.");
        userToUpdate.editing = false; // Exit editing mode
        userToUpdate.editable = null;
        await this.getUsers(); // Refresh the list
      } catch (error) {
        this.handleApiCatchError(error, "Failed to update user.");
        // Optionally, keep editing mode active on failure or revert editable changes
        // userToUpdate.editing = true; // Keep editing on if save fails
      } finally {
        this.loading = false;
        this.userToSave = null;
      }
    },
    cancelEdit(user) {
      user.editing = false;
      user.editable = null; // Discard editable changes
      // No need to fetch users again, just revert UI state
    },
    viewUser(userUuid) {
      this.$router.push({ name: 'ViewUser', params: { uuid: userUuid } }); // Ensure route param is 'uuid'
    },
    showSuccessModal(message) {
      this.successModal.message = message;
      this.successModal.show = true;
    },
    // showFailureModal(message) { // Replaced by helpers
    //   this.failModal.message = message;
    //   this.failModal.show = true;
    // },
    closeSuccessModal() {
      this.successModal.show = false;
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    // Re-using helper methods from UserProfile.vue for consistency
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => e.message || e.field).join(', ');
      } else if (responseData && responseData.message) {
        errorMsg = responseData.message;
      }
      console.error("API Response Error:", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true;
      this.apiError = true; // Set apiError flag
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error:", error.response ? error.response.data : error.message, error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server.";
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
      this.apiError = true; // Set apiError flag
    },
  },
  created() {
    this.getUsers();
    // this.fetchAvailableRoles(); // If using a select dropdown for roles
  },
};
</script>

