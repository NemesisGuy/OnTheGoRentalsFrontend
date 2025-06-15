<template>
  <div class="content-container">
    <div v-if="pageState === 'loading'" class="profile-card shimmer-card">
      <!-- Shimmer Loader for the new layout -->
      <div class="shimmer-left">
        <div class="shimmer shimmer-avatar"></div>
        <div class="shimmer shimmer-line" style="width: 60%; height: 24px; margin-top: 1rem;"></div>
        <div class="shimmer shimmer-line" style="width: 80%; height: 16px;"></div>
      </div>
      <div class="shimmer-right">
        <div class="shimmer shimmer-line" style="width: 40%; height: 20px; margin-bottom: 2rem;"></div>
        <div class="shimmer shimmer-line" style="width: 90%; height: 40px;"></div>
        <div class="shimmer shimmer-line" style="width: 90%; height: 40px;"></div>
        <div class="shimmer shimmer-line" style="width: 90%; height: 40px;"></div>
        <div class="shimmer-line shimmer" style="width: 40%; height: 20px; margin-top: 2rem; margin-bottom: 2rem;"></div>
        <div class="shimmer-button-grid">
          <div class="shimmer shimmer-button"></div>
          <div class="shimmer shimmer-button"></div>
          <div class="shimmer shimmer-button"></div>
        </div>
      </div>
    </div>

    <div v-else-if="pageState === 'error'" class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h2>Failed to Load Profile</h2>
      <p>{{ failModal.message || "We couldn't retrieve your profile information. Please try again later." }}</p>
    </div>

    <div v-else-if="pageState === 'success' && user" class="profile-card">
      <!-- Left Column: Avatar and Name -->
      <div class="profile-sidebar">
        <img :src="user.profileImageUrl || defaultAvatar" @error="onImageError" alt="Profile Image" class="avatar"/>
        <h2 class="user-name">{{ user.firstName }} {{ user.lastName }}</h2>
        <p class="user-email">{{ user.email }}</p>
        <button @click="editProfile" class="button edit-button">
          <i class="fa fa-pencil-alt"></i> Edit Profile
        </button>
      </div>

      <!-- Right Column: Details and Actions -->
      <div class="profile-main">
        <div class="panel">
          <h3 class="panel-title">Account Details</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <i class="fas fa-id-card"></i>
              <div>
                <strong>User ID</strong>
                <span>{{ user.uuid }}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="fas fa-user-shield"></i>
              <div>
                <strong>Roles</strong>
                <span>{{ user.roles ? user.roles.join(', ') : 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">My Activities</h3>
          <div class="action-grid">
            <button @click="viewMyBookings" class="button read-button">
              <i class="fas fa-calendar-plus"></i> My Bookings
            </button>
            <button @click="viewMyRentalHistory" class="button update-button ">
              <i class="fas fa-history"></i> Rental History
            </button>
            <button @click="goBack" class="button back-button">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <FailureModal
      key="profileFailureModal"
      :message="failModal.message"
      :show="failModal.show"
      @close="closeFailModal"
  />
</template>

<script>
// The script is largely the same, just simplified the API response handling
import api from '@/api';
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import defaultAvatar from '@/assets/Images/Defaults/default-user-avatar.png';

export default {
  name: "UserProfile",
  components: { FailureModal },
  data() {
    return {
      user: null,
      pageState: 'loading',
      failModal: { show: false, message: "" },
      defaultAvatar,
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      this.pageState = 'loading';
      if (!localStorage.getItem('accessToken')) {
        this.handleError("You must be logged in to view your profile. Redirecting...");
        setTimeout(() => this.$router.push({ name: 'Login' }), 2000);
        return;
      }
      try {
        const response = await api.get('/api/v1/users/me/profile');
        // Simplified check, as API should directly return the object
        if (response.data.data && response.data.data.uuid) {
          this.user = response.data.data;
          this.pageState = 'success';
        } else {
          throw new Error('Profile data could not be loaded or is incomplete.');
        }
      } catch (error) {
        this.handleError(error.response?.data?.message || "An error occurred while fetching your profile.");
      }
    },
    onImageError(event) {
      event.target.src = this.defaultAvatar;
    },
    handleError(message) {
      this.pageState = 'error';
      this.failModal = { show: true, message };
    },
    editProfile() { this.$router.push({ name: 'EditProfile' }); },
    viewMyBookings() { this.$router.push({ name: 'MyBookings' }); },
    viewMyRentalHistory() { this.$router.push({ name: 'RentalHistory' }); },
    closeFailModal() { this.failModal.show = false; },
    goBack() { this.$router.go(-1); },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem;
  min-height: 100%;
}

.profile-card {
  display: grid;
  grid-template-columns: 280px 1fr; /* Fixed sidebar, flexible main content */
  gap: 2rem;
  max-width: 1000px;
  margin: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
}

.profile-sidebar {
  padding: 2rem;
  text-align: center;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 6px solid #fff;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  margin-bottom: 1rem;
}
.user-name {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #343a40;
}
.user-email {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  word-break: break-all;
}
.edit-button {
  width: 100%;
}

.profile-main {
  padding: 2rem;
}

.panel {
  margin-bottom: 2rem;
}
.panel:last-child {
  margin-bottom: 0;
}
.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.75rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.detail-item i {
  font-size: 1.25rem;
  color: #007bff;
  width: 25px;
  text-align: center;
  margin-top: 5px;
}
.detail-item div {
  display: flex;
  flex-direction: column;
}
.detail-item strong {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-item span {
  font-size: 1rem;
  font-weight: 500;
  color: #343a40;
  word-break: break-all;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
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
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
/*.edit-button {
  background-color: #007bff;
  color: white;
}*/
.action-button {
  background-color: #f8f9fa;
  color: #343a40;
  border-color: #ced4da;
}
.action-button:hover {
  background-color: #e2e6ea;
}
.back-button {
  background-color: #6c757d;
  color: white;
}

/* Error and Shimmer States */
.error-container {
  text-align: center;
  padding: 60px 40px;
  background-color: #fff;
  border-radius: 16px;
  max-width: 600px;
  margin: auto;
}
.error-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.shimmer-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  padding: 0;
}
.shimmer { animation: shimmer 1.8s infinite linear; background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%); background-size: 1200px 100%; border-radius: 8px; }
.shimmer-left { padding: 2rem; display: flex; flex-direction: column; align-items: center; }
.shimmer-right { padding: 2rem; }
.shimmer-avatar { width: 150px; height: 150px; border-radius: 50%; }
.shimmer-line { height: 16px; margin-bottom: 10px; }
.shimmer-button-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.shimmer-button { height: 48px; }

/* Responsive */
@media (max-width: 768px) {
  .profile-card {
    grid-template-columns: 1fr; /* Stack columns on mobile */
  }
  .profile-sidebar {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
}
</style>