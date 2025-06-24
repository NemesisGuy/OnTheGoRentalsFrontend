<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-users-cog"></i> User Management</h1> <!-- Changed icon -->
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" @input="applySearchAndSort" placeholder="Search by Name, Email, UUID..." type="text"/>
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-times"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" :to="{ name: 'CreateUser' }">
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
        <th>UUID</th>
        <th @click="sortUsers('firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortUsers('email')">Email <i class="fas fa-sort"></i></th>
        <th>Roles <i @click="sortUsers('roles')" class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in usersToDisplay" :key="user.uuid">
        <td data-label="UUID">{{ user.uuid ? user.uuid.substring(0, 8) + '...' : 'N/A' }}</td>

        <td data-label="First Name" v-if="!user.editing">{{ user.firstName }}</td>
        <td data-label="First Name" v-else><input v-model="user.editable.firstName" type="text" class="form-control-inline"></td>

        <td data-label="Last Name" v-if="!user.editing">{{ user.lastName }}</td>
        <td data-label="Last Name" v-else><input v-model="user.editable.lastName" type="text" class="form-control-inline"></td>

        <td data-label="Email" v-if="!user.editing">{{ user.email }}</td>
        <td data-label="Email" v-else><input v-model="user.editable.email" type="email" class="form-control-inline"></td>

        <td data-label="Roles" v-if="!user.editing">
          <span v-for="(role, index) in user.roles" :key="index">
            {{ role }}<span v-if="index < user.roles.length - 1">, </span>
          </span>
        </td>
        <td data-label="Roles" v-else>
          <input v-model="user.editable.rolesString" type="text" class="form-control-inline" placeholder="e.g., USER,ADMIN">
        </td>

        <td class="actions-cell" data-label="Actions">
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
      allUsers: [],
      usersToDisplay: [],
      searchQuery: "",
      loading: false,
      apiError: false,
      showDeleteConfirmationModal: false,
      showSaveConfirmationModal: false,
      userToDelete: null,
      userToSave: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      currentSortColumn: 'lastName',
      currentSortDirection: 'asc',
    };
  },
  methods: {
    getUsers() {
      this.loading = true;
      this.apiError = false;
      this.failModal.show = false; // Reset fail modal before fetch

      return api.get('/api/v1/admin/users')
          .then(response => {
            if (response.data && response.data.status === "success") {
              this.allUsers = (response.data.data || []).map(user => ({
                ...user,
                editing: false,
                editable: null
              }));
              this.applySearchAndSort();
            } else {
              this.handleApiResponseError(response.data, "Failed to fetch users list.");
            }
          })
          .catch(error => {
            this.handleApiCatchError(error, "Failed to fetch users. Please try again.");
          })
          .finally(() => {
            this.loading = false;
          });
    },
    applySearchAndSort() {
      let filtered = [...this.allUsers]; // Work on a copy
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const lowerQuery = this.searchQuery.toLowerCase().trim();
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

          if (this.currentSortColumn === 'roles') {
            valA = valA?.join(', ');
            valB = valB?.join(', ');
          }

          if (valA == null) valA = '';
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
    executeDeleteUser() {
      if (this.userToDelete && this.userToDelete.uuid) {
        this.loading = true;
        this.showDeleteConfirmationModal = false;
        const uuidToDelete = this.userToDelete.uuid;

        api.delete(`/api/v1/admin/users/${uuidToDelete}`)
            .then(() => {
              this.showSuccessModal("User soft-deleted successfully.");
              return this.getUsers(); // Refresh list
            })
            .catch(error => {
              this.handleApiCatchError(error, "Failed to delete user or refresh list.");
            })
            .finally(() => {
              this.loading = false;
              this.userToDelete = null;
            });
      }
    },
    cancelDeleteUser() {
      this.userToDelete = null;
      this.showDeleteConfirmationModal = false;
    },
    startEditUser(user) {
      user.editable = JSON.parse(JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: [...user.roles],
        rolesString: user.roles.join(','),
        password: '',
        authProvider: user.authProvider,
        googleId: user.googleId,
        profileImageUrl: user.profileImageUrl,
        deleted: user.deleted
      }));
      user.editing = true;
    },
    confirmSaveUser(user) {
      this.userToSave = user;
      this.showSaveConfirmationModal = true;
    },
    cancelSaveUser() {
      this.userToSave = null;
      this.showSaveConfirmationModal = false;
    },
    executeSaveUser() {
      if (!this.userToSave || !this.userToSave.editable) return;

      this.showSaveConfirmationModal = false;
      this.loading = true;

      const userToUpdate = this.userToSave;
      const updatePayload = {
        firstName: userToUpdate.editable.firstName,
        lastName: userToUpdate.editable.lastName,
        email: userToUpdate.editable.email,
        roleNames: userToUpdate.editable.rolesString ? userToUpdate.editable.rolesString.split(',').map(r => r.trim()).filter(r => r) : [],
        authProvider: userToUpdate.editable.authProvider,
        googleId: userToUpdate.editable.googleId,
        profileImageUrl: userToUpdate.editable.profileImageUrl,
        deleted: userToUpdate.editable.deleted,
      };
      if (userToUpdate.editable.password && userToUpdate.editable.password.trim() !== "") {
        updatePayload.password = userToUpdate.editable.password;
      }

      api.put(`/api/v1/admin/users/${userToUpdate.uuid}`, updatePayload)
          .then(() => {
            this.showSuccessModal("User updated successfully.");
            // Update the user in allUsers directly to reflect changes without full re-fetch if preferred for performance
            // Or just rely on getUsers to refresh the entire list
            userToUpdate.editing = false;
            userToUpdate.editable = null; // Clear editable data
            return this.getUsers(); // Refresh the list
          })
          .catch(error => {
            this.handleApiCatchError(error, "Failed to update user or refresh list.");
          })
          .finally(() => {
            this.loading = false;
            this.userToSave = null;
          });
    },
    cancelEdit(user) {
      user.editing = false;
      user.editable = null;
    },
    viewUser(userUuid) {
      this.$router.push({ name: 'ViewUser', params: { uuid: userUuid } });
    },
    showSuccessModal(message) {
      this.successModal.message = message;
      this.successModal.show = true;
    },
    closeSuccessModal() {
      this.successModal.show = false;
    },
    closeFailModal() {
      this.failModal.show = false;
    },
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
      this.apiError = true;
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error:", error.response ? error.response.data : error.message, error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) { // Check if it's a simple string error
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your network connection.";
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true;
      this.apiError = true;
    },
  },
  created() {
    this.getUsers();
  },
};
</script>
<!--

<style scoped>
/* Add your component-specific styles here */
/* For example, if you had specific styles for UsersManagement */
.content-container {
  color: black;
  padding: 20px;
  background-color: #f9f9f9; /* Light background for the content area */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); /* Softer shadow */
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px; /* Increased margin */
  padding-bottom: 15px; /* Padding for visual separation */
  border-bottom: 1px solid #e0e0e0; /* Subtle border */
  flex-wrap: wrap;
}

.content-header h1 {
  margin: 0;
  font-size: 1.75em; /* Slightly adjusted font size */
  color: #333;
  font-weight: 600; /* Bolder title */
}
.content-header h1 .fas {
  margin-right: 12px; /* More space for icon */
  color: #007bff;
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  display: flex;
  align-items: center;
  border: 1px solid #ced4da; /* Standard Bootstrap-like border color */
  border-radius: 0.25rem; /* Standard border radius */
  overflow: hidden;
  background-color: #fff; /* White background for input group */
}

.search-input input[type="text"] {
  padding: 0.375rem 0.75rem; /* Standard padding */
  border: none;
  outline: none;
  font-size: 1em;
  flex-grow: 1;
  min-width: 200px; /* Decent minimum width */
  color: #495057; /* Standard input text color */
}
.search-input input[type="text"]::placeholder {
  color: #6c757d; /* Standard placeholder color */
}


.button {
  padding: 0.375rem 0.75rem; /* Standard button padding */
  border: 1px solid transparent; /* Base border */
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 400;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  text-decoration: none;
  white-space: nowrap; /* Prevent text wrapping in buttons */
}

.button .fas {
  margin-right: 4px; /* Space between icon and text */
}

.button:hover {
  opacity: 0.85; /* Slightly different hover effect */
}
.button:active {
  transform: translateY(1px);
}
.button:focus {
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); /* Focus ring similar to Bootstrap */
}


.read-button { /* General view/read button */
  background-color: #17a2b8; /* Info Blue */
  color: white;
  border-color: #17a2b8;
}
.search-input .read-button { /* Reset button specific style */
  background-color: #6c757d; /* Secondary/Gray for Reset */
  color: white;
  border-color: #6c757d;
  border-radius: 0;
}
.search-input .read-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(108,117,125,.5);
}


.add-button {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}
.add-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(40,167,69,.5);
}

.update-button, .save-button { /* Edit and Save are often similar */
  background-color: #ffc107;
  color: #212529; /* Dark text for yellow background */
  border-color: #ffc107;
}
.update-button:focus, .save-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(255,193,7,.5);
}


.delete-button {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}
.delete-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(220,53,69,.5);
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}
.cancel-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(108,117,125,.5);
}


table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07); /* Lighter shadow for table */
  border-radius: 0.25rem; /* Rounded corners for table */
  overflow: hidden; /* To make border-radius apply to th/td */
}

th, td {
  padding: 0.75rem; /* Standard table cell padding */
  text-align: left;
  border-bottom: 1px solid #dee2e6; /* Standard table border color */
  vertical-align: middle; /* Align cell content vertically */
}

th {
  background-color: #f8f9fa; /* Lighter header background */
  color: #495057; /* Darker text for light header */
  cursor: pointer;
  font-weight: 600; /* Bolder table headers */
  border-top: 1px solid #dee2e6; /* Top border for header */
}
th .fas.fa-sort {
  margin-left: 5px;
  opacity: 0.6;
}

tr:hover {
  background-color: #f1f1f1;
}

.form-control-inline {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
.form-control-inline:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}


.actions-column {
  width: auto;
  white-space: nowrap;
}
.actions-cell { /* For the td containing action buttons */
  white-space: nowrap;
}
.actions-cell button {
  margin-right: 5px;
}
.actions-cell button:last-child {
  margin-right: 0;
}

.loading-overlay {
  position: fixed; /* Or absolute if container is relative */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7); /* Semi-transparent white */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top */
}
.no-data-message {
  text-align: center;
  padding: 40px 20px; /* More padding */
  font-size: 1.1em;
  color: #6c757d; /* Softer color for no data message */
  background-color: #fff;
  border: 1px dashed #ced4da; /* Dashed border */
  border-radius: 0.25rem;
  margin-top: 20px;
}
.error-text {
  color: #dc3545; /* Bootstrap danger color */
  border-color: #f5c6cb; /* Lighter danger for border */
  background-color: #f8d7da; /* Light danger background */
}

.text-warning {
  color: #ffc107 !important; /* Ensure warning text is visible */
}
.modal-body-container { /* This div wraps modals, ensure it doesn't interfere with layout */
  /* No specific styles needed unless it's causing layout issues */
}

/* Responsive Table Styles */
@media (max-width: 992px) { /* Adjust breakpoint for when table becomes too wide */
  .actions-column, .actions-cell {
    min-width: 220px; /* Give action buttons more space before wrapping table */
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .search-bar-container {
    width: 100%;
  }
  .search-bar {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
  .search-input input[type="text"] {
    min-width: 0;
  }
  .add-button {
    width: 100%;
    justify-content: center;
  }

  table thead {
    display: none;
  }
  table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    padding: 0.5rem;
    background-color: #fff;
  }
  table td {
    display: block;
    text-align: right;
    padding-left: 45% !important; /* Ensure higher specificity if needed */
    position: relative;
    border-bottom: 1px dotted #eee;
    min-height: 38px; /* Ensure cell has some height for the label */
    box-sizing: border-box;
  }
  table td:last-child {
    border-bottom: none;
  }
  table td::before {
    content: attr(data-label);
    position: absolute;
    left: 0.75rem; /* Match cell padding */
    width: 40%;
    padding-right: 0.5rem;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
    color: #495057;
  }

  td.actions-cell, table td:has(> template > button) {
    text-align: left;
    padding-left: 0.75rem !important; /* Reset padding for actions */
    display: flex;
    flex-wrap: wrap;
    gap: 8px; /* More gap for buttons */
  }
  td.actions-cell::before, table td:has(> template > button)::before {
    display: none;
  }
  td.actions-cell button, table td:has(> template > button) button {
    flex-grow: 1;
    margin-right: 0;
    min-width: 100px; /* Ensure buttons are tappable */
  }
  .form-control-inline {
    width: 100%;
  }
}
</style>

    -->
