<template>
  <div class="card-container">
    <div class="content-container">
      <LoadingModal v-if="loading" show message="Loading car details..."/>
      <div v-else-if="error" class="error-container">
        <p><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
        <button class="back-button button" @click="goBack">Go Back</button>
      </div>
      <div v-else-if="car" class="car-detail-card">
        <div class="card-header">
          <h1>{{ car.make }} {{ car.model }}</h1>
          <p class="year-badge">{{ car.year }}</p>
        </div>
        <div class="card-body">
          <!-- The Carousel component is placed here -->
          <div class="image-section">
            <Carousel :images="car.imageUrls" :fallback-image="defaultCarImage" />
          </div>
          <div class="details-section">
            <h2>Details</h2>
            <ul>
              <li><strong>Category:</strong> <span>{{ car.category || 'N/A' }}</span></li>
              <li><strong>Price Group:</strong> <span class="price-group">{{ car.priceGroup }}</span></li>
              <li><strong>License Plate:</strong> <span class="license-plate">{{ car.licensePlate }}</span></li>
              <li><strong>VIN:</strong> <span>{{ car.vin || 'N/A' }}</span></li>
              <li>
                <strong>Availability:</strong>
                <span :class="car.available ? 'status-available' : 'status-unavailable'">
                  <i :class="car.available ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ car.available ? 'Available for Rent' : 'Not Available' }}
                </span>
              </li>
            </ul>
            <div class="booking-action">
              <button class="button accept-button large-button clear-padding" @click="bookCar" :disabled="!car.available">
                <i class="fas fa-calendar-plus"></i> Book Now
              </button>
            </div>
          </div>
        </div>
        <div class="button-container-bottom">
          <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back to List</button>
        </div>
      </div>
    </div>
    <FailureModal v-if="failModal.show"
                  @close="closeFailureModalAndRedirectToLogin"
                  :show="failModal.show"
                  :message="failModal.message"/>
  </div>
</template>

<script>
import api from "@/api";
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import Carousel from '@/components/Main/Carousel/Carousel.vue'; // Import the Carousel
import defaultCarImage from '@/assets/Images/Defaults/default-car-image.png';

/**
 * ViewCar.vue
 * Displays the detailed information for a single car, including a gallery of images.
 * This component is intended for public users to view car details and initiate the booking process.
 */
export default {
  name: 'ViewCar',
  components: {
    LoadingModal,
    FailureModal,
    Carousel, // Register the Carousel component
  },
  data() {
    return {
      car: null,
      loading: true,
      error: null,
      defaultCarImage: defaultCarImage,
      failModal: { show: false, message: "" },
    };
  },
  /**
   * When the component is mounted, it fetches the details for the specific car
   * using the UUID from the route parameters.
   */
  mounted() {
    this.fetchCarDetails();
  },
  methods: {
    /**
     * Fetches car data from the public API endpoint.
     */
    fetchCarDetails() {
      const uuid = this.$route.params.uuid;
      if (!uuid) {
        this.error = "No car specified.";
        this.loading = false;
        return;
      }

      this.loading = true;
      // This uses the PUBLIC endpoint for cars.
      api.get(`/api/v1/cars/${uuid}`)
          .then(response => {
            if (response.data && response.data.status === 'success' && response.data.data) {
              this.car = response.data.data;
            } else {
              // Handle cases where the API returns success but no data
              throw new Error("Car data could not be loaded or car not found.");
            }
          })
          .catch(err => {
            this.error = err.response?.data?.message || err.message || "An error occurred while fetching car details.";
          })
          .finally(() => {
            this.loading = false;
          });
    },

    /**
     * Handles the "Book Now" button click.
     * It checks if the user is authenticated before navigating to the booking creation page.
     */
    bookCar() {
      // Check for an access token to determine if the user is logged in.
      if (!localStorage.getItem('accessToken')) {
        this.failModal = { show: true, message: "You must be logged in to book a car. Redirecting to login..." };
        return;
      }
      // Navigate to the booking creation page, passing the car's UUID as a parameter.
      this.$router.push({ name: 'CreateBooking', params: { carUuid: this.car.uuid } });
    },

    /**
     * Handles the closing of the failure modal.
     * If the error message indicates a login is required, it redirects the user.
     */
    closeFailureModalAndRedirectToLogin() {
      const message = this.failModal.message.toLowerCase();
      this.failModal.show = false;
      if (message.includes("logged in") || message.includes("unauthorized")) {
        this.$router.push({ name: 'Login' });
      }
    },

    /**
     * Navigates one step back in the browser's history.
     */
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

.car-detail-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  max-width: 1200px;
  margin: auto;
}
.card-header {
  padding: 20px 30px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #343a40;
}
.year-badge {
  background: #007bff;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-weight: bold;
}
.card-body {
  display: flex;
  flex-wrap: wrap;
  padding: 30px;
  gap: 40px;
  color: var(--color-text-black);

}
.image-section {
  flex: 2 1 500px; /* Let image section grow larger */
  min-width: 300px;
}
.details-section {
  flex: 1 1 300px;
}
.details-section h2 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-size: 1.5rem;
}
.details-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.details-section li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  font-size: 1rem;
}
.details-section li strong {
  color: #495057;
  margin-right: 10px;
}
.price-group {
  font-weight: bold;
  color: #007bff;
}
.license-plate {
  font-family: 'Courier New', Courier, monospace;
  background-color: #e9ecef;
  padding: 3px 8px;
  border-radius: 4px;
}
.status-available { color: #28a745; font-weight: bold; }
.status-unavailable { color: #dc3545; font-weight: bold; }
.booking-action {
  margin-top: 30px;
  text-align: center;
}
.large-button {
  padding: 15px 40px;
  font-size: 1.2rem;
  width: 100%;
}
.button-container-bottom {
  display: flex;
  justify-content: center;
  padding: 20px 30px;
  border-top: 1px solid #e9ecef;
}
.error-container {
  text-align: center;
  padding: 40px;
}
.clear-padding{
  padding: 0 !important;
}
</style>