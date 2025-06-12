<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>
      <form @submit.prevent="submitProfileUpdate" novalidate>
        <h2 class="form-header">Edit Your Profile</h2>

        <!-- Image Upload Section -->
        <div class="form-group profile-image-section">
          <label>Profile Image:</label>
          <div class="image-preview-container">
            <img :src="profileImagePreview" alt="Profile Preview" class="avatar-preview">
          </div>
          <input id="profileImage" type="file" @change="handleFileChange" accept="image/jpeg, image/png, image/gif">
          <label for="profileImage" class="file-input-label button" :class="{ 'disabled': isLoading }">
            <i class="fas fa-upload"></i> Choose New Image
          </label>
        </div>
        <hr>

        <!-- User Details Section -->
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model.trim="editedUser.firstName" required type="text" autocomplete="given-name" :class="{ 'is-invalid': validationErrors.firstName }">
          <small v-if="validationErrors.firstName" class="form-text text-danger">{{ validationErrors.firstName }}</small>
        </div>

        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model.trim="editedUser.lastName" required type="text" autocomplete="family-name" :class="{ 'is-invalid': validationErrors.lastName }">
          <small v-if="validationErrors.lastName" class="form-text text-danger">{{ validationErrors.lastName }}</small>
        </div>

        <div class="form-group">
          <label for="email">Email (cannot be changed):</label>
          <input id="email" :value="editedUser.email" disabled type="email" class="form-control-plaintext text-muted">
        </div>
        <hr>
        <p class="password-note">Only fill in the password fields if you want to change your current password.</p>
        <div class="form-group">
          <label for="password">New Password:</label>
          <input id="password" v-model="editedUser.password" type="password" autocomplete="new-password" :class="{ 'is-invalid': validationErrors.password }">
          <small v-if="validationErrors.password" class="form-text text-danger">{{ validationErrors.password }}</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input id="confirmPassword" v-model="editedUser.confirmPassword" type="password" autocomplete="new-password" :class="{ 'is-invalid': validationErrors.confirmPassword }">
          <small v-if="validationErrors.confirmPassword" class="form-text text-danger">{{ validationErrors.confirmPassword }}</small>
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="isLoading">
            <i class="fas fa-check"></i> {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
          <button class="back-button button" type="button" @click="goBack()" :disabled="isLoading">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>

    <!-- Modals -->
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

/**
 * @file EditProfile.vue
 * @description Allows an authenticated user to edit their own profile information,
 * including first name, last name, password, and profile image.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-06-11 (Updated)
 */
export default {
  name: "EditProfile",
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      /** @type {Object} Holds the user's editable data. */
      editedUser: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
      /** @type {File|null} Stores the selected image file for upload. */
      profileImageFile: null,
      /** @type {string} URL for the image preview. */
      profileImagePreview: defaultAvatar,
      /** @type {Object} Controls the loading modal. */
      loadingModal: { show: false, message: "Saving..." },
      /** @type {boolean} A simplified flag for the loading state. */
      isLoading: false,
      /** @type {Object} State for the success modal. */
      successModal: { show: false, message: "" },
      /** @type {Object} State for the failure modal. */
      failModal: { show: false, message: "" },
      /** @type {Object} Holds client-side validation errors. */
      validationErrors: {},
    };
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    /**
     * Fetches the current user's profile data to populate the form.
     */
    async loadUserProfile() {
      this.isLoading = true;
      this.loadingModal = { show: true, message: "Loading profile..." };
      try {
        const response = await api.get('/api/v1/users/me/profile');
        const user = response.data.data;
        if (user?.uuid) {
          this.editedUser.firstName = user.firstName;
          this.editedUser.lastName = user.lastName;
          this.editedUser.email = user.email;
          if (user.profileImageUrl) {
            this.profileImagePreview = user.profileImageUrl;
          }
        } else {
          throw new Error("Profile data is missing or invalid.");
        }
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || 'Could not load your profile data.');
      } finally {
        this.isLoading = false;
        this.loadingModal.show = false;
      }
    },

    /**
     * Handles the file input change event. Validates the file and creates a local preview URL.
     * @param {Event} event - The file input change event.
     */
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.showFailureModal("File is too large. Please select an image under 5MB.");
        return;
      }
      if (file.type.startsWith('image/')) {
        this.profileImageFile = file;
        this.profileImagePreview = URL.createObjectURL(file);
      } else {
        this.profileImageFile = null;
        this.showFailureModal("Invalid file type. Please select a valid image (jpeg, png, gif).");
      }
    },

    /**
     * Validates the form inputs before submission.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    validateForm() {
      this.validationErrors = {};
      if (!this.editedUser.firstName) this.validationErrors.firstName = "First name is required.";
      if (!this.editedUser.lastName) this.validationErrors.lastName = "Last name is required.";
      if (this.editedUser.password) {
        if (this.editedUser.password.length < 6) {
          this.validationErrors.password = "Password must be at least 6 characters.";
        }
        if (this.editedUser.password !== this.editedUser.confirmPassword) {
          this.validationErrors.confirmPassword = "Passwords do not match.";
        }
      }
      return Object.keys(this.validationErrors).length === 0;
    },

    /**
     * Main submission handler. Validates the form and orchestrates the two-step update process.
     */
    async submitProfileUpdate() {
      if (!this.validateForm()) {
        const firstError = Object.values(this.validationErrors)[0];
        this.showFailureModal(firstError || "Please correct the form errors.");
        return;
      }

      this.isLoading = true;
      this.loadingModal = { show: true, message: "Saving changes..." };

      try {
        await this.updateProfileData();
        await this.uploadProfileImage(); // This will only run if an image was selected

        // If both succeed (or if image upload was skipped), show final success.
        this.successModal = { show: true, message: "Profile updated successfully!" };

      } catch (error) {
        // Errors are handled within the individual methods, this is a final catch-all.
        console.error("An error occurred during the update process:", error);
      } finally {
        this.isLoading = false;
        this.loadingModal.show = false;
      }
    },

    /**
     * Step 1 of the update process: Updates text-based user data.
     * @returns {Promise<void>}
     */
    async updateProfileData() {
      const payload = {
        firstName: this.editedUser.firstName,
        lastName: this.editedUser.lastName,
      };
      if (this.editedUser.password) {
        payload.password = this.editedUser.password;
      }

      try {
        await api.put('/api/v1/users/me/profile', payload);
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || 'Failed to update profile data.');
        throw error; // Propagate error to stop the chain
      }
    },

    /**
     * Step 2 of the update process: Uploads the profile image if one was selected.
     * @returns {Promise<void>}
     */
    async uploadProfileImage() {
      if (!this.profileImageFile) {
        return Promise.resolve(); // No image to upload, resolve immediately.
      }

      this.loadingModal.message = "Uploading image...";
      const formData = new FormData();
      formData.append('file', this.profileImageFile);

      try {
        await api.post('/api/v1/users/me/profile-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || 'Profile data was saved, but the image upload failed.');
        throw error; // Propagate error
      }
    },

    showFailureModal(message) {
      this.failModal = { show: true, message };
    },
    closeFailureModal() {
      this.failModal.show = false;
    },
    closeModalAndGoBack() {
      this.successModal.show = false;
      this.$router.push({ name: 'UserProfile' }); // Go to the profile view page
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>

.profile-image-section { text-align: center; margin-bottom: 20px; }
.image-preview-container { margin-bottom: 15px; }
.avatar-preview { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #f0f2f5; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
input[type="file"] { display: none; }
.file-input-label { display: inline-block; padding: 10px 15px; cursor: pointer; background-color: #007bff; color: white; border-radius: 5px; font-size: 0.9rem; }
.file-input-label.disabled { background-color: #6c757d; cursor: not-allowed; }
.file-input-label:hover:not(.disabled) { background-color: #0056b3; }
.password-note { font-size: 0.85rem; color: #6c757d; text-align: center; margin-bottom: 20px; }
hr { margin: 25px 0; border-top: 1px solid #e9ecef; }
.form-control-plaintext { background-color: #e9ecef; opacity: 1; cursor: not-allowed; }
.is-invalid { border-color: #dc3545; }
</style>