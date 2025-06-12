<template>
  <div class="card-container">
    <div class="form-container">
      <!-- Loading State: Shimmer Effect -->
      <div v-if="pageState === 'loading'">
        <div class="shimmer-card">
          <div class="shimmer-line shimmer centered" style="width: 60%; height: 24px; margin-bottom: 15px;"></div>
          <hr>
          <div class="centered"><div class="shimmer-avatar shimmer"></div></div>
          <hr>
          <div class="shimmer-line shimmer" style="width: 40%; height: 16px; margin-bottom: 15px;"></div>
          <div class="shimmer-line shimmer" style="width: 70%; height: 16px;"></div>
          <div class="shimmer-line shimmer" style="width: 50%; height: 16px; margin-bottom: 15px;"></div>
          <div class="shimmer-line shimmer" style="width: 80%; height: 16px;"></div>
          <hr>
          <div class="button-container-shimmer">
            <div class="shimmer-button shimmer"></div>
            <div class="shimmer-button shimmer"></div>
            <div class="shimmer-button shimmer"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="pageState === 'error'" class="error-display">
        <p class="error-text">{{ failModal.message || "Failed to load profile. Please try again later." }}</p>
      </div>

      <!-- Success State: Profile Data Display -->
      <div v-else-if="pageState === 'success' && user && user.uuid">
        <div class="form-header">
          <h2>
            <i class="fas fa-user-circle"></i> <!-- Changed icon for a more 'profile' feel -->
            {{ user.firstName }} {{ user.lastName }}'s Profile
          </h2>
        </div>
        <hr class="header-hr">
        <div class="profile-info">
          <div class="profile-image">
            <img
                :src="user.profileImageUrl || defaultAvatar"
                @error="onImageError"
                alt="Profile Image"
                class="avatar"
                :key="user.profileImageUrl"
            />
          </div>
          <hr>
          <p> <strong> <i class="fas fa-id-card"> </i> UUID: </strong> <span>{{ user.uuid?.substring(0, 30) }}...</span></p>
          <p><strong><i class="fas fa-envelope"> </i> Email: </strong> <span>{{ user.email }}</span></p>
          <p><strong><i class="fas fa-user"> </i> First Name: </strong> <span>{{ user.firstName }}</span></p>
          <p><strong><i class="fas fa-user"> </i> Last Name: </strong> <span>{{ user.lastName }}</span></p>
          <p v-if="user.roles?.length > 0" class="roles-p">
            <strong><i class="fas fa-user-shield"> </i> Roles: </strong> <span>{{ user.roles.join(', ') }}</span>
          </p>

          <div class="button-container">
            <button @click="viewMyBookings" class="button read-button">
              <i class="fas fa-calendar-plus"> </i> My Bookings
            </button>
            <button @click="editProfile" class="button update-button">
              <i class="fa fa-pencil-alt"> </i> Edit Profile
            </button>
            <button @click="viewMyRentalHistory" class="button accept-button">
              <i class="fas fa-history"> </i> Rental History
            </button>
            <button @click="goBack" class="button deny-button">
              <i class="fas fa-arrow-left"> </i> Back
            </button>
          </div>
        </div>
      </div>

      <!-- Fallback for no user data in success state -->
      <div v-else class="error-display">
        <p class="error-text">User profile data is not available or incomplete.</p>
      </div>
    </div>
  </div>

  <!-- Modals for feedback -->
  <FailureModal
      key="profileFailureModal"
      :message="failModal.message"
      :show="failModal.show"
      @close="closeFailModal"
  />
</template>

<script>
import api from '@/api';
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import defaultAvatar from '@/assets/Images/Defaults/default-user-avatar.png';

/**
 * @file UserProfile.vue
 * @description Displays the authenticated user's profile information. Provides navigation
 * to edit the profile and view booking/rental history. It is designed to be robust,
 * handling loading and error states gracefully.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-06-11 (Updated)
 */
export default {
  name: "UserProfile",
  components: { FailureModal },
  data() {
    return {
      /** @type {Object|null} Stores the user's profile data. */
      user: null,
      /** @type {'loading' | 'success' | 'error'} Manages the current state of the page. */
      pageState: 'loading',
      /** @type {Object} State for the failure feedback modal. */
      failModal: { show: false, message: "" },
      /** @type {string} A static reference to the default avatar image. */
      defaultAvatar,
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    /**
     * Fetches the profile data for the currently authenticated user from the API.
     */
    async fetchUserProfile() {
      this.pageState = 'loading';
      if (!localStorage.getItem('accessToken')) {
        this.handleError("You must be logged in to view your profile. Redirecting...");
        setTimeout(() => this.$router.push({ name: 'Login' }), 2000);
        return;
      }
      try {
        const response = await api.get('/api/v1/users/me/profile');
        if (response.data?.status === 'success' && response.data.data?.uuid) {
          this.user = response.data.data;
          this.pageState = 'success';
        } else {
          throw new Error(response.data?.errors?.[0]?.message || 'Profile data is incomplete.');
        }
      } catch (error) {
        this.handleError(error.response?.data?.message || "An error occurred while fetching your profile.");
      }
    },
    /**
     * A robust image error handler that replaces a broken image source with a default avatar.
     * @param {Event} event - The error event from the <img> tag.
     */
    onImageError(event) {
      console.warn("Failed to load profile image, using fallback.");
      event.target.src = this.defaultAvatar;
    },
    /**
     * Centralized error handling function.
     * @param {string} message - The error message to display.
     */
    handleError(message) {
      this.pageState = 'error';
      this.failModal = { show: true, message };
    },
    /** Navigates to the profile edit page. */
    editProfile() { this.$router.push({ name: 'EditProfile' }); },
    /** Navigates to the user's booking history page. */
    viewMyBookings() { this.$router.push({ name: 'MyBookings' }); },
    /** Navigates to the user's rental history page. */
    viewMyRentalHistory() { this.$router.push({ name: 'RentalHistory' }); },
    /** Closes the failure modal. */
    closeFailModal() { this.failModal.show = false; },
    /** Navigates back to the previous page. */
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
/* Main containers - preserved as requested */
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

/* Header and Avatar Styling */
.form-header { text-align: center; margin-bottom: 25px; color: #333; }
.form-header h2 { font-size: 1.8rem; font-weight: 600; color: #343a40; }
.form-header h2 i { margin-right: 12px; color: #007bff; }
.profile-image { text-align: center; margin-bottom: 25px; }
.avatar { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 5px solid #fff; box-shadow: 0 5px 20px rgba(0,0,0,0.12); }

/* Details Section Styling */
.profile-info { text-align: left; }
.profile-info p {
  margin: 0 0 15px 0;
  font-size: 1rem;
  color: #555;
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
}
.profile-info p.roles-p {
  border-bottom: none; /* Remove border from the last item */
}
.profile-info p strong {
  display: inline-flex;
  align-items: center;
  min-width: 150px; /* Aligns the text that follows */
  font-weight: 500;
  color: #495057;
}
.profile-info p strong i {
  margin-right: 12px;
  color: #007bff;
  width: 24px;
  text-align: center;
  font-size: 1.1rem;
}

/* Button Container and Button Styles */
.button-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Responsive columns */
  gap: 15px;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e9ecef;
}
.button {
  padding: 12px 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.button i { font-size: 0.9em; }

/* Button Color Variations */
.btn-primary { /* My Bookings (Primary) */
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}
.btn-primary:hover { background-color: #0069d9; }

.btn-secondary { /* Edit Profile (Secondary) */
  background-color: #f8f9fa;
  color: #343a40;
  border-color: #ced4da;
}
.btn-secondary:hover { background-color: #e2e6ea; }

.btn-info { /* Rental History (Informational) */
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: white;
}
.btn-info:hover { background-color: #138496; }

/* General & Shimmer Styles (Unchanged) */
hr { margin: 25px 0; border: 0; border-top: 1px solid #e9ecef; }
hr.header-hr { margin-top: 0; }
.error-display { padding: 40px; text-align: center; }
.error-text { color: #dc3545; font-weight: bold; font-size: 1.1rem; }
.shimmer-card { padding: 20px; }
.shimmer { animation: shimmer 1.8s infinite linear; background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%); background-size: 1200px 100%; border-radius: 8px; }
.centered { display: flex; justify-content: center; }
.shimmer-avatar { width: 140px; height: 140px; border-radius: 50%; }
.shimmer-line { height: 16px; margin-bottom: 10px; }
.shimmer-line.centered { margin-left: auto; margin-right: auto; }
.button-container-shimmer { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; }
.shimmer-button { height: 48px; }
</style>