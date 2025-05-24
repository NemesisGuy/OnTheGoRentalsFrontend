<template>
  <div class="card-container">
    <div class="form-container">
      <LoadingModal v-if="isLoading" show></LoadingModal>

      <div v-if="isLoading">
        <div class="shimmer-card">
          <!-- Title line -->
          <div class="shimmer-line shimmer centered" style="width: 80%; height: 20px;"></div>
          <hr>
          <!-- Avatar -->
          <div class="centered">
            <div class="shimmer-avatar shimmer"></div>
          </div>
          <hr>
          <!-- Text lines -->
          <div class="shimmer-line shimmer centered" style="width: 70%;"></div>
          <div class="shimmer-line shimmer centered" style="width: 90%;"></div>
          <div class="shimmer-line shimmer centered" style="width: 50%;"></div>
          <hr>
          <!-- Simulated button shimmer -->
          <div class="centered">
            <div class="shimmer-button shimmer"
                 style="width: 150px; height: 40px; border-radius: 5px; margin-right: 20px"></div>
            <div class="shimmer-button shimmer" style="width: 150px; height: 40px; border-radius: 5px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="errorLoading">
        <p class="error-text">Failed to load profile. Please try again later.</p>
      </div>

      <div v-else>
        <div class="form-header">
          <h2><i class="fas fa-user"></i> {{ user.firstName }}</h2>
        </div>
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
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>
          <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>
          <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>
          <hr>
          <div class="button-container">
            <button @click="editProfile" class="update-button button">
              <i class="fa fa-pencil"></i> Edit Profile
            </button>
            <button @click="viewRentalHistory" class="read-button button">
              View Rental History
            </button>
            <button @click="viewBookingHistory" class="update-button button">View Booking History</button>
          </div>
        </div>
        <hr>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default {
  name: "UserProfile",
  components: {
    LoadingModal,
  },
  data() {
    return {
      user: {},
      isLoading: true,
      errorLoading: false,
    };
  },

  async mounted() {
    await this.fetchUserProfile();
  },

  methods: {
    async fetchUserProfile() {
      this.isLoading = true;
      this.errorLoading = false;

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("No access token found");
        this.errorLoading = true;
        this.isLoading = false;
        return;
      }

      try {
        const response = await api.get('/api/user/profile/read/profile');
        this.user = response.data;
      } catch (error) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
        this.errorLoading = true;
      } finally {
        this.isLoading = false;
      }
    },

    editProfile() {
      this.$router.push("/edit-profile");
    },

    viewRentalHistory() {
      this.$router.push("/user/profile/rental-history");
    },
    viewBookingHistory()
    {
      // this.$router.push("/user-profile/my-bookings");
      this.$router.push({ name: 'MyBookings' }); // Or 'MyBookings' if you defined that
    }
  },
};
</script>

<style scoped>
.card-container {
  padding: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.shimmer-card {
  padding: 20px;
  border-radius: 8px;
  background: #fff;
}

.shimmer {
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
  background-size: 1000px 100%;
  border-radius: 4px;
  margin-bottom: 10px;
}

.shimmer-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 20px;
}

.shimmer-line {
  height: 15px;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.shimmer-button {
  margin-top: 20px;
}


@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.error-text {
  color: red;
  font-weight: bold;
  text-align: center;
}
</style>
