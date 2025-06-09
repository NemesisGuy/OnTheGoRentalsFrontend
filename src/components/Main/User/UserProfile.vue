<template>
  <div class="card-container">
    <div class="form-container">
      <!-- Shimmer loading effect -->
      <div v-if="isLoading">
        <div class="shimmer-card">
          <div class="shimmer-line shimmer centered" style="width: 60%; height: 24px; margin-bottom: 15px;"></div>
          <hr style="margin-bottom: 20px;">
          <div class="centered">
            <div class="shimmer-avatar shimmer"></div>
          </div>
          <hr style="margin-top: 20px; margin-bottom: 20px;">
          <div class="shimmer-line shimmer" style="width: 40%; height: 16px; margin-bottom: 15px;"></div>
          <div class="shimmer-line shimmer" style="width: 70%; height: 16px;"></div>
          <div class="shimmer-line shimmer" style="width: 50%; height: 16px; margin-bottom: 15px;"></div>
          <div class="shimmer-line shimmer" style="width: 80%; height: 16px;"></div>
          <hr style="margin-top: 20px; margin-bottom: 20px;">
          <div class="button-container-shimmer centered">
            <div class="shimmer-button shimmer"></div>
            <div class="shimmer-button shimmer"></div>
          <div class="shimmer-button shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-else-if="errorLoading && !isLoading">
      <p class="error-text">{{ failModal.message || "Failed to load profile. Please try again later." }}</p>
    </div>

    <!-- Profile Data Display -->
    <div v-else-if="user && user.uuid">
      <div class="form-header">
        <h2>
          <i class="fas fa-user"></i>
          {{ user.firstName || 'User' }} {{ user.lastName || '' }}
          <span v-if="user.firstName || user.lastName">'s Profile</span>
          <span v-else>Profile</span>
        </h2>
      </div>
      <hr>
      <div class="profile-info">
        <div class="profile-image">
          <!--
            This is the logic to display the image.
            1. It checks if `user.profileImageUrl` exists.
            2. It sets the `src` to this URL.
            3. The `@error` handler is a fallback. If the browser fails to load the image
               (due to a 401, 404, or network error), it will call the `onImageError` method,
               which replaces the broken image with the default placeholder.
          -->
          <img
              v-if="user.profileImageUrl"
              :src="user.profileImageUrl"
              @error="onImageError"
              alt="Profile Image"
              class="avatar"
          />
          <!-- This v-else block is a secondary fallback, just in case the URL is null from the start. -->
          <img
              v-else
              src="@/assets/Images/Defaults/default-user-avatar.png"
              alt="Placeholder Image"
              class="avatar"
          />
        </div>
        <hr>
        <p><strong><i class="fas fa-id-card"></i> UUID: </strong> {{ user.uuid?.substring(0, 8) || 'N/A' }}...</p>
        <p><strong><i class="fas fa-envelope"></i> Email: </strong> {{ user.email || 'N/A' }}</p>
        <p><strong><i class="fas fa-user"></i> First Name: </strong> {{ user.firstName || 'N/A' }}</p>
        <p><strong><i class="fas fa-user"></i> Last Name: </strong> {{ user.lastName || 'N/A' }}</p>
        <p v-if="user.roles && user.roles.length > 0">
          <strong><i class="fas fa-user-shield"></i> Roles: </strong> {{ user.roles.join(', ') }}
        </p>
        <hr>
        <div class="button-container">
          <button @click="editProfile" class="update-button button">
            <i class="fa fa-pencil"></i> Edit Profile
          </button>
          <button @click="viewMyBookings" class="action-button button">
            <i class="fas fa-calendar-plus"></i> My Bookings
          </button>
          <button @click="viewMyRentalHistory" class="read-button button">
            <i class="fas fa-history"></i> My Rental History
          </button>
        </div>
        <hr>
      </div>
    </div>

    <!-- Fallback for no user data -->
    <div v-else-if="!isLoading && !errorLoading && (!user || !user.uuid)">
      <p class="error-text">User profile data is not available.</p>
    </div>
    <div class="button-container">
      <button class="back-button button" @click="goBack()">
        <i class="fas fa-arrow-left"></i> Back
      </button>
    </div>
  </div>

  <!-- Modals -->
  <div class="modal-body-container">
    <LoadingModal :show="showActualLoadingModal" message="Processing..."/>
    <FailureModal
        key="profileFailureModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailModal"
    />
  </div>
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import defaultAvatar from '@/assets/Images/Defaults/default-user-avatar.png'; // Import default avatar

export default {
  name: "UserProfile",
  components: {
    LoadingModal,
    FailureModal,
  },
  data() {
    return {
      user: {},
      isLoading: true,
      errorLoading: false,
      showActualLoadingModal: false,
      failModal: { show: false, message: "" },
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    fetchUserProfile() {
      this.isLoading = true;
      this.errorLoading = false;
      this.failModal.show = false;

      if (!localStorage.getItem('accessToken')) {
        console.warn("UserProfile: No access token. Redirecting to login.");
        this.failModal.message = "You are not logged in. Redirecting...";
        this.failModal.show = true;
        this.isLoading = false;
        this.errorLoading = true;
        setTimeout(() => this.$router.push({ name: 'Login' }), 1500);
        return;
      }

      api.get('/api/v1/users/me/profile')
          .then(response => {
            if (response.data && response.data.status === 'success' && response.data.data && response.data.data.uuid) {
              this.user = response.data.data;
            } else {
              const errorMessage = response.data.errors?.map(e => e.message).join(', ') || 'Profile data is incomplete.';
              console.error("UserProfile: Fetched data is invalid or status not success.", response.data);
              this.failModal.message = errorMessage;
              this.failModal.show = true;
              this.errorLoading = true;
            }
          })
          .catch(error => {
            console.error("Error fetching user profile:", error.response?.data || error.message);
            let errorMsg = "An error occurred while fetching your profile.";

            if (error.response?.data?.errors?.length > 0) {
              errorMsg = error.response.data.errors.map(e => e.message).join(', ');
            } else if (error.response?.data?.message) {
              errorMsg = error.response.data.message;
            }

            this.failModal.message = errorMsg;
            this.failModal.show = true;
            this.errorLoading = true;
          })
          .finally(() => {
            this.isLoading = false;
          });
    },

    /**
     * This method is called by the @error event on the <img> tag.
     * It will replace the 'src' of the event's target (the broken image)
     * with the imported default placeholder image.
     */
    onImageError(event) {
      console.warn("Failed to load profile image from:", event.target.src, "- using fallback.");
      event.target.src = defaultAvatar;
    },

    editProfile() {
      this.$router.push({ name: 'EditProfile' });
    },

    viewMyBookings() {
      this.$router.push({ name: 'MyBookings' });
    },

    viewMyRentalHistory() {
      this.$router.push({ name: 'RentalHistory' });
    },

    closeFailModal() {
      this.failModal.show = false;
    },

    goBack() {
      this.$router.go(-1);
    }
  },
};
</script>

<style scoped>
.card-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.form-container {
  background-color: #ffffff;
  padding: 25px 35px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 700px;
}

.form-header {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.form-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
}

.form-header h2 i {
  margin-right: 12px;
  color: #007bff;
}

.profile-info {
  text-align: left;
}

.profile-info p {
  margin-bottom: 15px;
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  display: flex;
  align-items: center;
}

.profile-info p strong i {
  margin-right: 10px;
  color: #007bff;
  width: 24px;
  text-align: center;
  font-size: 1.1rem;
}

.profile-image {
  text-align: center;
  margin-bottom: 25px;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.button-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px; /* Increased gap for better spacing */
  margin-top: 20px;
}

.button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 160px;
  text-align: center;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
.button i {
  margin-right: 8px;
}

.update-button {
  background-color: #ffc107;
  color: #212529;
}
.update-button:hover {
  background-color: #e0a800;
}

.read-button {
  background-color: #17a2b8;
  color: white;
}
.read-button:hover {
  background-color: #138496;
}

.action-button {
  background-color: #007bff;
  color: white;
}
.action-button:hover {
  background-color: #0056b3;
}

.back-button {
  background-color: #6c757d;
  color: white;
  margin-top: 15px;
}
.back-button:hover {
  background-color: #5a6268;
}

.error-text {
  color: #dc3545;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  font-size: 1.1rem;
}

hr {
  margin: 20px 0;
  border: 0;
  border-top: 1px solid #e9ecef;
}

.modal-body-container {
  /* For positioning modals if needed */
}

/* Shimmer effect styles */
.shimmer-card {
  padding: 20px;
  border-radius: 12px;
  background: #fff;
}
.shimmer {
  animation: shimmer 1.8s infinite linear;
  background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
  background-size: 1200px 100%;
  border-radius: 4px;
  margin-bottom: 12px;
}
.centered {
  display: flex;
  justify-content: center;
}
.shimmer-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
}
.shimmer-line {
  height: 16px;
}
.shimmer-line.centered {
  margin-left: auto;
  margin-right: auto;
}
.button-container-shimmer {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}
.shimmer-button {
  height: 45px;
  width: 160px;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: -1200px 0;
  }
  100% {
    background-position: 1200px 0;
  }
}
</style>