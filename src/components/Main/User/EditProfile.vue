<template>
  <div class="content-container">
    <div class="page-header">
      <h1>Edit Your Profile</h1>
      <p>Keep your personal information up to date.</p>
    </div>

    <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

    <form class="edit-profile-card" @submit.prevent="submitProfileUpdate" novalidate>
      <!-- Left Column: Image Upload -->
      <div class="image-panel">
        <label>Profile Image</label>
        <div class="image-preview-container">
          <img :src="profileImagePreview" alt="Profile Preview" class="avatar-preview">
        </div>
        <input id="profileImage" type="file" @change="handleFileChange" accept="image/jpeg, image/png, image/gif" ref="fileInput">
        <button type="button" class="button image-button" @click="$refs.fileInput.click()" :disabled="isLoading">
          <i class="fas fa-upload"></i> Choose Image
        </button>
        <small class="image-note">Max 5MB (JPG, PNG, GIF)</small>
      </div>

      <!-- Right Column: Form Fields -->
      <div class="form-panel">
        <div class="form-section">
          <h3 class="section-title">Personal Information</h3>
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input id="firstName" v-model.trim="editedUser.firstName" required type="text" autocomplete="given-name" :class="{ 'is-invalid': validationErrors.firstName }">
            <small v-if="validationErrors.firstName" class="form-error">{{ validationErrors.firstName }}</small>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input id="lastName" v-model.trim="editedUser.lastName" required type="text" autocomplete="family-name" :class="{ 'is-invalid': validationErrors.lastName }">
            <small v-if="validationErrors.lastName" class="form-error">{{ validationErrors.lastName }}</small>
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" :value="editedUser.email" disabled type="email" class="form-input-disabled">
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Change Password</h3>
          <p class="password-note">Only fill these fields if you want to set a new password.</p>
          <div class="form-group">
            <label for="password">New Password</label>
            <input id="password" v-model="editedUser.password" type="password" autocomplete="new-password" :class="{ 'is-invalid': validationErrors.password }">
            <small v-if="validationErrors.password" class="form-error">{{ validationErrors.password }}</small>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" v-model="editedUser.confirmPassword" type="password" autocomplete="new-password" :class="{ 'is-invalid': validationErrors.confirmPassword }">
            <small v-if="validationErrors.confirmPassword" class="form-error">{{ validationErrors.confirmPassword }}</small>
          </div>
        </div>

        <div class="button-container">
          <button class="button back-button" type="button" @click="goBack()" :disabled="isLoading">
            <i class="fas fa-arrow-left"></i> Cancel
          </button>
          <button class="button save-button" type="submit" :disabled="isLoading">
            <i class="fas fa-check"></i> {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </form>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndGoBack" />
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeFailureModal" />
  </div>
</template>

<script>
// The <script> block is unchanged as it was already correct.
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";
import defaultAvatar from "@/assets/Images/Defaults/default-user-avatar.png";

export default {
  name: "EditProfile",
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      editedUser: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
      profileImageFile: null,
      profileImagePreview: defaultAvatar,
      loadingModal: { show: false, message: "Saving..." },
      isLoading: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      validationErrors: {},
    };
  },
  mounted() { this.loadUserProfile(); },
  methods: {
    async loadUserProfile() {
      this.isLoading = true;
      this.loadingModal = { show: true, message: "Loading profile..." };
      try {
        const response = await api.get('/api/v1/users/me/profile');
        const user = response.data.data || response.data;
        if (user?.uuid) {
          this.editedUser.firstName = user.firstName;
          this.editedUser.lastName = user.lastName;
          this.editedUser.email = user.email;
          if (user.profileImageUrl) this.profileImagePreview = user.profileImageUrl;
        } else { throw new Error("Profile data is missing or invalid."); }
      } catch (error) { this.showFailureModal(error.response?.data?.message || 'Could not load your profile data.');
      } finally { this.isLoading = false; this.loadingModal.show = false; }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { this.showFailureModal("File is too large (max 5MB)."); return; }
      if (file.type.startsWith('image/')) {
        this.profileImageFile = file;
        this.profileImagePreview = URL.createObjectURL(file);
      } else { this.showFailureModal("Invalid file type. Please select an image."); }
    },
    validateForm() {
      this.validationErrors = {};
      if (!this.editedUser.firstName) this.validationErrors.firstName = "First name is required.";
      if (!this.editedUser.lastName) this.validationErrors.lastName = "Last name is required.";
      if (this.editedUser.password) {
        if (this.editedUser.password.length < 6) this.validationErrors.password = "Password must be at least 6 characters.";
        if (this.editedUser.password !== this.editedUser.confirmPassword) this.validationErrors.confirmPassword = "Passwords do not match.";
      }
      return Object.keys(this.validationErrors).length === 0;
    },
    async submitProfileUpdate() {
      if (!this.validateForm()) { this.showFailureModal(Object.values(this.validationErrors)[0] || "Please correct form errors."); return; }
      this.isLoading = true;
      this.loadingModal = { show: true, message: "Saving changes..." };
      try {
        await this.updateProfileData();
        await this.uploadProfileImage();
        this.successModal = { show: true, message: "Profile updated successfully!" };
      } catch (error) { console.error("Update process failed:", error);
      } finally { this.isLoading = false; this.loadingModal.show = false; }
    },
    async updateProfileData() {
      const payload = { firstName: this.editedUser.firstName, lastName: this.editedUser.lastName };
      if (this.editedUser.password) payload.password = this.editedUser.password;
      try { await api.put('/api/v1/users/me/profile', payload);
      } catch (error) { this.showFailureModal(error.response?.data?.message || 'Failed to update profile data.'); throw error; }
    },
    async uploadProfileImage() {
      if (!this.profileImageFile) return Promise.resolve();
      this.loadingModal.message = "Uploading image...";
      const formData = new FormData();
      formData.append('file', this.profileImageFile);
      try { await api.post('/api/v1/users/me/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } catch (error) { this.showFailureModal(error.response?.data?.message || 'Profile data saved, but image upload failed.'); throw error; }
    },
    showFailureModal(message) { this.failModal = { show: true, message }; },
    closeFailureModal() { this.failModal.show = false; },
    closeModalAndGoBack() {
      this.successModal.show = false;
      this.$router.push({ name: 'UserProfile' });
    },
    goBack() { this.$router.go(-1); }
  }
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 { font-weight: 700; color: #343a40; }
.page-header p { color: #6c757d; }

.edit-profile-card {
  display: grid;
  grid-template-columns: 300px 1fr; /* Fixed sidebar for image, flexible for form */
  gap: 2rem;
  max-width: 1000px;
  margin: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  overflow: hidden;
}

.image-panel {
  background-color: #f8f9fa;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-right: 1px solid #e9ecef;
}
.image-panel label {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #343a40;
}
.image-preview-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
  background: #e9ecef;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.image-button {
  width: 100%;
}
.image-note {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
}
input[type="file"] { display: none; }

.form-panel {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
}
.form-group input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}
.form-input-disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
.form-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.is-invalid {
  border-color: #dc3545;
}
.password-note {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.save-button {
  background-color: #28a745;
  color: white;
}
.back-button {
  background-color: #fff;
  color: #495057;
  border-color: #ced4da;
}
.back-button:hover {
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .edit-profile-card {
    grid-template-columns: 1fr; /* Stack columns on mobile */
  }
  .image-panel {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
}
</style>