<template>
  <div class="card-container">
    <div class="form-container"> <!-- Or profile-display-container -->
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

      <div v-else-if="errorLoading && !isLoading">
        <p class="error-text">{{ failModal.message || "Failed to load profile. Please try again later." }}</p>
      </div>

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
            <img
                v-if="user.profileImageUrl"
                :src="user.profileImageUrl"
                alt="Profile Image"
                class="avatar"
            />
            <img
                v-else
                src="@/assets/Images/Defaults/default-user-avatar.png"
                alt="Placeholder Image"
                class="avatar"
            />
          </div>
          <hr>
          <p><strong><i class="fas fa-id-card"></i> UUID: </strong> {{ user.uuid ? user.uuid : 'N/A' }}...</p>
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
            <button @click="viewMyBookings" class="action-button button"> <!-- Changed class -->
              <i class="fas fa-calendar-plus"></i> My Bookings
            </button>
            <button @click="viewMyRentalHistory" class="read-button button"> <!-- Changed class -->
              <i class="fas fa-history"></i> My Rental History
            </button>
          </div>
          <hr>
        </div>
      </div>
      <div v-else-if="!isLoading && !errorLoading && (!user || !user.uuid)">
        <p class="error-text">User profile data is not available.</p>
      </div>
      <div v-else>
        <LoadingModal :show="isLoading" message="Loading user profile..."/>

    </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack()">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
      </div>

  </div>

  <div class="modal-body-container">
    <LoadingModal :show="showActualLoadingModal" message="Processing..."/>
    <FailureModal
        key="profileFailureModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailModal"
    />
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Used for action-based loading
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

/**
 * @file UserProfile.vue
 * @description Displays the profile information for the currently authenticated user.
 * It fetches user data from an API and provides navigation to edit the profile,
 * view bookings, and view rental history. Includes shimmer loading effects and error handling.
 * @component UserProfile
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "UserProfile",
  components: {
    LoadingModal, // For action-based loading, not initial page load (which uses shimmer)
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object} user - Stores the fetched user profile data.
   * @property {boolean} isLoading - True when initially fetching the user profile (triggers shimmer).
   * @property {boolean} errorLoading - True if an error occurred during the initial profile fetch.
   * @property {boolean} showActualLoadingModal - True to show the full-screen loading modal for subsequent actions (not used in current methods).
   * @property {object} failModal - Controls the failure modal.
   * @property {boolean} failModal.show - Visibility of failure modal.
   * @property {string} failModal.message - Message for failure modal.
   */
  data() {
    return {
      user: {}, // Will be populated with { uuid, email, firstName, lastName, roles, profileImageUrl }
      isLoading: true, // For initial page load shimmer
      errorLoading: false,
      showActualLoadingModal: false,
      failModal: { show: false, message: "" },
    };
  },
  /**
   * Computed properties for the component.
   * @type {object}
   * @property {boolean} isUserLoggedIn - Checks for the presence of an 'accessToken' in localStorage.
   *                                      (Note: This is a client-side check. The component primarily relies on
   *                                      the success of `fetchUserProfile` API call for displaying data,
   *                                      which itself requires authentication.)
   */
  computed: {
    isUserLoggedIn() {
      return !!localStorage.getItem('accessToken');
    }
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the user's profile data.
   */
  async mounted() {
    await this.fetchUserProfile();
  },
  methods: {
    /**
     * Fetches the profile of the currently authenticated user from the API.
     * Manages loading and error states. Redirects to login if no access token is found
     * or if the API call indicates an authentication issue.
     * @async
     * @returns {void}
     */
    async fetchUserProfile() {
      this.isLoading = true;
      this.errorLoading = false;
      this.failModal.show = false;

      if (!localStorage.getItem('accessToken')) { // Client-side check before API call
        console.warn("UserProfile: No access token found. Redirecting to login.");
        this.failModal.message = "You are not logged in. Redirecting to login page...";
        this.failModal.show = true;
        this.isLoading = false;
        this.errorLoading = true; // Indicate error state
        setTimeout(() => {
          this.$router.push({ name: 'Login' }); // Ensure 'Login' is a valid route name
        }, 1500); // Delay to allow user to see message
        return;
      }

      try {
        const response = await api.get('/api/v1/users/me/profile');
        if (response.data && response.data.status === "success" && response.data.data) {
          this.user = response.data.data;
          if (!this.user.uuid) { // Check for essential data
            console.error("UserProfile: Fetched user data is incomplete (missing UUID).", this.user);
            this.errorLoading = true;
            this.failModal.message = "Profile data loaded is incomplete. Please try again.";
            this.failModal.show = true;
          }
        } else { // Handle unexpected success response structure
          let errorMsg = "Failed to load profile: Unexpected response structure from server.";
          if(response.data?.errors?.length > 0) {
            errorMsg = response.data.errors.map(e => e.message).join(', ');
          } else if (response.data?.message) {
            errorMsg = response.data.message;
          }
          console.error("UserProfile: API fetch successful but response format unexpected or status not 'success'.", response.data);
          this.failModal.message = errorMsg;
          this.failModal.show = true;
          this.errorLoading = true;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error.response?.data || error.message, error);
        let errorMsg = "An error occurred while fetching your profile. Please try again.";
        if (error.response?.data?.errors?.length > 0) {
          errorMsg = error.response.data.errors.map(e => e.message).join(', ');
        } else if (error.response?.data && typeof error.response.data === 'string') {
          errorMsg = error.response.data; // Simple string error
        } else if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
        }
        this.failModal.message = errorMsg;
        this.failModal.show = true;
        this.errorLoading = true;
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
           this.$router.push({ name: 'Login' });
        }
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Navigates to the 'EditProfile' page for the current user.
     * @returns {void}
     */
    editProfile() {
      // The EditProfile component typically fetches '/me/profile', so no ID param is strictly needed
      // if it's always for the current user.
      this.$router.push({ name: 'EditProfile' });
    },

    /**
     * Navigates to the 'MyBookings' page for the current user.
     * @returns {void}
     */
    viewMyBookings() {
      this.$router.push({ name: 'MyBookings' });
    },

    /**
     * Navigates to the 'RentalHistory' page for the current user.
     * @returns {void}
     */
    viewMyRentalHistory() {
      this.$router.push({ name: 'RentalHistory' });
    },

    /**
     * Closes the failure modal.
     * @returns {void}
     */
    closeFailModal() {
      this.failModal.show = false;
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
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

.form-container { /* Using this class for consistent card appearance */
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
  justify-content: center; /* Center buttons if fewer, or space-around */
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
 /* margin-top: 30px;*/
  gap: 5px;
}

.button {
  padding: 10px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  min-width: 160px; /* Give buttons some minimum width */
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
.button i {
  margin-right: 8px;
}

.update-button {
  background-color: #ffc107; /* Warning yellow */
  color: #212529;
}
.update-button:hover {
  background-color: #e0a800;
}

.read-button { /* For Rental History */
  background-color: #17a2b8; /* Info cyan */
  color: white;
}
.read-button:hover {
  background-color: #138496;
}

.action-button { /* New class for My Bookings, or reuse one */
  background-color: #007bff; /* Primary blue */
  color: white;
}
.action-button:hover {
  background-color: #0056b3;
}


.loading-container, .error-container {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #555;
}
.error-text { /* For direct error message in template if not using modal */
  color: #dc3545;
  font-weight: bold;
  text-align: center;
  padding: 20px;
}

hr {
  margin: 10px 0;
  border: 0;
  border-top: 1px solid #b7b7ba;
}

.modal-body-container {
  /* For positioning modals if needed */
}

/* Shimmer effect styles - kept as is from previous */
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
.shimmer-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin-bottom: 20px;
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
  margin-top: 30px;
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