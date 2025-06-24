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
        <input id="profileImage" type="file" @change="handleFileChange" accept="image/jpeg, image/png, image/gif" ref="fileInput" style="display: none;">
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
            <input id="firstName" v-model.trim="editedUser.firstName" required type="text" :class="{ 'is-invalid': validationErrors.firstName }">
            <small v-if="validationErrors.firstName" class="form-error">{{ validationErrors.firstName }}</small>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input id="lastName" v-model.trim="editedUser.lastName" required type="text" :class="{ 'is-invalid': validationErrors.lastName }">
            <small v-if="validationErrors.lastName" class="form-error">{{ validationErrors.lastName }}</small>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Change Password</h3>
          <p class="password-note">Leave blank to keep your current password.</p>
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
          <button class="button back-button" type="button" @click="goBack()" :disabled="isLoading">Cancel</button>
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
        } else { throw new Error("Profile data is invalid."); }
      } catch (error) { this.showFailureModal(error.response?.data?.message || 'Could not load your profile.');
      } finally { this.isLoading = false; this.loadingModal.show = false; }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { this.showFailureModal("File is too large (max 5MB)."); return; }
      if (file.type.startsWith('image/')) {
        this.profileImageFile = file;
        this.profileImagePreview = URL.createObjectURL(file);
      } else { this.showFailureModal("Invalid file type."); }
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
      if (!this.validateForm()) return;
      this.isLoading = true;
      this.loadingModal = { show: true, message: "Saving changes..." };
      try {
        await this.updateProfileData();
        await this.uploadProfileImage();

        // --- THE FIX IS HERE ---
        await this.refreshLocalUserData();

        this.successModal = { show: true, message: "Profile updated successfully!" };
      } catch (error) {
        console.error("Update process failed:", error);
      } finally {
        this.isLoading = false;
        this.loadingModal.show = false;
      }
    },
    async updateProfileData() {
      const payload = { firstName: this.editedUser.firstName, lastName: this.editedUser.lastName };
      if (this.editedUser.password) payload.password = this.editedUser.password;
      try { await api.put('/api/v1/users/me/profile', payload); } catch (error) {
        this.showFailureModal(error.response?.data?.message || 'Failed to update profile data.');
        throw error;
      }
    },
    async uploadProfileImage() {
      if (!this.profileImageFile) return;
      this.loadingModal.message = "Uploading image...";
      const formData = new FormData();
      formData.append('file', this.profileImageFile);
      try { await api.post('/api/v1/users/me/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || 'Image upload failed.');
        throw error;
      }
    },
    async refreshLocalUserData() {
      try {
        console.log("Refreshing local user data after update...");
        const response = await api.get('/api/v1/users/me/profile');
        const updatedUser = response.data.data || response.data;
        if (updatedUser?.email) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new CustomEvent('auth-change'));
          console.log("Local user data refreshed and auth-change event dispatched.");
        }
      } catch (e) {
        console.error("Failed to refresh local user data. The navbar might not update until the next login.", e);
      }
    },
    showFailureModal(message) { this.failModal = { show: true, message }; },
    closeFailureModal() { this.failModal.show = false; },
    closeModalAndGoBack() {
      this.successModal.show = false;
      this.$router.push({ name: 'UserProfile' });
    },
    goBack() { this.$router.go(-1); },
  }
};
</script>

<style scoped>
/* Styles are unchanged and correct */
.content-container { padding: 2rem 1rem; background-color: #f4f7f6; }
.page-header { text-align: center; margin-bottom: 2rem; }
.edit-profile-card { display: grid; grid-template-columns: 300px 1fr; gap: 0; max-width: 1000px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.1); overflow: hidden; }
.image-panel { background-color: #f8f9fa; padding: 2rem; display: flex; flex-direction: column; align-items: center; text-align: center; border-right: 1px solid #e9ecef; }
.image-preview-container { width: 150px; height: 150px; border-radius: 50%; margin-bottom: 1rem; background: #e9ecef; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.avatar-preview { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.image-button { width: 100%; background-color: #007bff; color:white; }
.image-note { font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem; }
.form-panel { padding: 2.5rem; }
.form-section { margin-bottom: 2rem; }
.section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; }
.password-note { font-size: 0.9rem; color: #6c757d; margin-bottom: 1rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 12px 15px; border: 1px solid #ced4da; border-radius: 8px; }
.form-error { color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; }
.is-invalid { border-color: #dc3545; }
.button-container { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e9ecef; }
.button { padding: 12px 20px; font-weight: 600; border-radius: 8px; }
.save-button { background-color: #28a745; color: white; }
.back-button { background-color: #6c757d; color: white; }
@media (max-width: 768px) { .edit-profile-card { grid-template-columns: 1fr; } .image-panel { border-right: none; border-bottom: 1px solid #e9ecef; } }
</style>