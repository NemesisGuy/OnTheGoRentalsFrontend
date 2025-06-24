<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form @submit.prevent="addUser">
        <div class="form-header">
          <h2><i class="fas fa-user-plus"></i> Add User</h2>
        </div>
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="user.firstName" placeholder="Enter first name" required type="text">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="user.lastName" placeholder="Enter last name" required type="text">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="user.email" placeholder="Enter email" required type="email">
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input id="password" v-model="user.password" placeholder="Enter password" required type="password">
        </div>
        <div class="form-group">
          <label for="role">Role:</label>
          <!-- This now correctly binds to a simple string -->
          <select id="role" v-model="user.roleName" required>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>
        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
          <button class="back-button button" type="button" @click="goBack">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>
    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeAndGoBack"
        @close="closeAndGoBack"
        @confirm="closeAndGoBack"
        @ok="closeAndGoBack"
    ></SuccessModal>

    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    ></FailureModal>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

const router = useRouter();

const getInitialUserState = () => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  roleName: "USER", // Simplified state for the role
});

const user = reactive(getInitialUserState());

const loadingModal = reactive({ show: false });
const successModal = reactive({ show: false, message: "" });
const failModal = reactive({ show: false, message: "" });

const addUser = async () => {
  loadingModal.show = true;

  // --- THE FIX IS HERE ---
  // Create a payload that exactly matches the backend UserCreateDTO
  const payload = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    roleNames: [user.roleName], // Send as an array of strings
  };

  console.log("Sending payload:", payload);

  try {
    const response = await api.post("/api/v1/admin/users", payload);
    console.log("User added successfully:", response.data);
    loadingModal.show = false;
    successModal.message = "User added successfully!";
    successModal.show = true;
  } catch (error) {
    console.error("Failed to add user:", error);
    loadingModal.show = false;
    // Extract more specific error message if available
    const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
    failModal.message = `Failed to add user: ${errorMessage}`;
    failModal.show = true;
  }
};

const resetForm = () => {
  Object.assign(user, getInitialUserState());
};

const closeModal = () => {
  successModal.show = false;
  failModal.show = false;
};

const closeAndGoBack = () => {
  closeModal();
  goBack();
}

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
/* Scoped styles remain the same and are assumed to be correct */
/*.card-container-admin {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 2rem auto;
}

.form-container-admin {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.form-header h2 {
  font-weight: 700;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 5px rgba(232, 62, 140, 0.2);
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-button {
  background-color: var(--primary-color);
  color: white;
}

.confirm-button:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-2px);
}

.back-button {
  background-color: #6c757d;
  color: white;
}

.back-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}*/

</style>