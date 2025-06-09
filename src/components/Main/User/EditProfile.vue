<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" message="Saving..."/>
      <form @submit.prevent="submitProfileUpdate">
        <h2 class="form-header">Edit Your Profile</h2>

        <!-- Image Upload Section -->
        <div class="form-group profile-image-section">
          <label>Profile Image:</label>
          <div class="image-preview-container">
            <img :src="profileImagePreview" alt="Profile Preview" class="avatar-preview">
          </div>
          <input id="profileImage" type="file" @change="handleFileChange" accept="image/jpeg, image/png, image/gif">
          <label for="profileImage" class="file-input-label button">
            <i class="fas fa-upload"></i> Choose New Image
          </label>
        </div>
        <hr>

        <!-- User Details Section -->
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="editedUser.firstName" placeholder="Enter first name" required type="text">
        </div>

        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="editedUser.lastName" placeholder="Enter last name" required type="text">
        </div>

        <div class="form-group">
          <label for="email">Email (cannot be changed):</label>
          <input id="email" v-model="editedUser.email" disabled type="email">
        </div>
        <hr>
        <p class="password-note">Only fill in the password fields if you want to change your current password.</p>
        <div class="form-group">
          <label for="password">New Password:</label>
          <input id="password" v-model="editedUser.password" placeholder="Enter new password" type="password" autocomplete="new-password">
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input id="confirmPassword" v-model="editedUser.confirmPassword" placeholder="Confirm new password" type="password" autocomplete="new-password">
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit">
            <i class="fas fa-check"></i> Save Changes
          </button>
          <button class="back-button button" type="button" @click="goBack()">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>

    <!-- Modals -->
    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModalAndGoBack"
    />
    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModalAndGoBack"
    />
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
      editedUser: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      profileImageFile: null,
      profileImagePreview: defaultAvatar,
      loadingModal: {show: false},
      successModal: {show: false, message: ""},
      failModal: {show: false, message: ""}
    };
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    loadUserProfile() {
      this.loadingModal.show = true;
      api.get('/api/v1/users/me/profile')
          .then(response => {
            // CORRECTED: Access the nested data object due to the API wrapper
            const user = response.data.data;
            if (user && user.uuid) {
              this.editedUser.firstName = user.firstName;
              this.editedUser.lastName = user.lastName;
              this.editedUser.email = user.email;
              if (user.profileImageUrl) {
                this.profileImagePreview = user.profileImageUrl;
              }
            } else {
              throw new Error("Profile data is missing or invalid.");
            }
          })
          .catch(error => {
            const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || error.message || 'Could not load your profile.';
            this.failModal = { show: true, message: errorMsg };
          })
          .finally(() => {
            this.loadingModal.show = false;
          });
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.profileImageFile = file;
        this.profileImagePreview = URL.createObjectURL(file);
      } else {
        this.profileImageFile = null;
        this.failModal = { show: true, message: "Please select a valid image file (jpeg, png)." };
      }
    },

    submitProfileUpdate() {
      this.loadingModal.show = true;

      if (this.editedUser.password && this.editedUser.password !== this.editedUser.confirmPassword) {
        this.loadingModal.show = false;
        this.failModal = { show: true, message: "Passwords do not match." };
        return;
      }

      // Step 1: Update text-based profile data
      const profileDataPayload = {
        firstName: this.editedUser.firstName,
        lastName: this.editedUser.lastName,
      };

      if (this.editedUser.password) {
        profileDataPayload.password = this.editedUser.password;
      }

      api.put('/api/v1/users/me/profile', profileDataPayload)
          .then(response => {
            if (response.data.status !== 'success') {
              throw new Error(response.data.errors?.map(e => e.message).join(', ') || 'Failed to update profile data.');
            }

            if (!this.profileImageFile) {
              // No new image, so we're done.
              this.loadingModal.show = false;
              this.successModal = { show: true, message: "Profile updated successfully!" };
              return;
            }

            // Step 2: If profile update is successful, upload the image
            const formData = new FormData();
            formData.append('file', this.profileImageFile);

            // **THE FIX:** Explicitly set the Content-Type header for this request
            // to override any global JSON default in your api.js instance.
            return api.post('/api/v1/users/me/profile-image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          })
          .then(imageResponse => {
            // This block runs only if an image was uploaded.
            if (imageResponse && imageResponse.data.status === 'success') {
              this.loadingModal.show = false;
              this.successModal = { show: true, message: "Profile and image updated successfully!" };
            }
          })
          .catch(error => {
            this.loadingModal.show = false;
            const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || error.message || 'An unexpected error occurred.';
            this.failModal = { show: true, message: errorMsg };
          });
    },

    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },

    closeModalAndGoBack() {
      this.closeModal();
      this.goBack();
    },

    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
/*
@import "@/assets/css/form.css";
*/

.profile-image-section {
  text-align: center;
  margin-bottom: 20px;
}
.image-preview-container {
  margin-bottom: 15px;
}
.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f2f5;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
input[type="file"] {
  display: none;
}
.file-input-label {
  display: inline-block;
  padding: 10px 15px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  font-size: 0.9rem;
}
.file-input-label:hover {
  background-color: #0056b3;
}
.password-note {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 20px;
}
hr {
  margin: 25px 0;
  border-top: 1px solid #e9ecef;
}
</style>