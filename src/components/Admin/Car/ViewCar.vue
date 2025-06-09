<template>
  <div class="card-container card-container-admin" >
  <div class="content-container">
    <LoadingModal v-if="loading" show message="Loading car details..."/>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="back-button button" @click="goBack">Go Back</button>
    </div>
    <div v-else-if="car" class="car-detail-card">
      <div class="card-header">
        <h1>{{ car.make }} {{ car.model }}</h1>
        <p class="year-badge">{{ car.year }}</p>
      </div>
      <div class="card-body">
        <!-- THE CHANGE IS HERE: Replace the old image-section with the Carousel component -->
        <div class="image-section">
          <Carousel :images="car.imageUrls" :fallback-image="defaultCarImage" />
        </div>
        <div class="details-section">
          <h2>Details</h2>
          <ul>
            <li><strong>Category:</strong> <span class="text-uppercase text-bg-light">{{ car.category }}</span></li>
            <li><strong>Price Group:</strong> <span class="price-group">{{ car.priceGroup }}</span></li>
            <li><strong>License Plate:</strong> <span class="text-uppercase text-bg-light">{{ car.licensePlate }}</span></li>
            <li><strong>VIN:</strong> <span class="text-uppercase text-bg-light"> {{ car.vin || 'N/A' }}</span></li>
            <li>
              <strong>Availability:</strong>
              <span :class="car.available ? 'status-available' : 'status-unavailable'">
                <i :class="car.available ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                {{ car.available ? 'Available for Rent' : 'Not Available' }}
              </span>
            </li>
          </ul>
<!--          <div class="booking-action">
            <button class="accept-button button large-button clear-padding" @click="bookCar">
              <i class="fas fa-handshake"></i> Book Now
            </button>
          </div>-->
        </div>
      </div>
      <div class="button-container-bottom">
        <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back to List</button>
      </div>
    </div>
  </div>
  </div>
  <FailureModal v-if="failModal.show"
                @close="closeFailureModalAndRedirectToLogin"
                :show="failModal.show"
                :message="failModal.message"/>
</template>

<script>
import api from "@/api";
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import Carousel from '@/components/Main/Carousel/Carousel.vue'; // <-- Import the new component
import defaultCarImage from '@/assets/Images/Defaults/default-car-image.png';

export default {
  name: 'ViewCar', // Changed from CarDetail to ViewCar to match your other files
  components: {
    LoadingModal,
    FailureModal,
    Carousel // <-- Register the component
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
  mounted() {
    this.fetchCarDetails();
  },
  methods: {
    fetchCarDetails() {
      const uuid = this.$route.params.uuid; // Changed from carUuid for consistency
      if (!uuid) {
        this.error = "No car specified.";
        this.loading = false;
        return;
      }
      this.loading = true;
      api.get(`/api/v1/admin/cars/${uuid}`) // Changed to use the admin endpoint to see all cars
          .then(response => {
            if (response.data && response.data.status === 'success' && response.data.data) {
              this.car = response.data.data;
            } else {
              throw new Error("Car data could not be loaded.");
            }
          })
          .catch(err => {
            this.error = err.response?.data?.message || err.message || "An error occurred.";
          })
          .finally(() => {
            this.loading = false;
          });
    },
    bookCar() {
      if (!localStorage.getItem('accessToken')) {
        this.failModal = { show: true, message: "You must be logged in to book a car. Redirecting..." };
        return;
      }
      this.$router.push({ name: 'CreateBooking', params: { carUuid: this.car.uuid } });
    },
    closeFailureModalAndRedirectToLogin() {
      this.failModal.show = false;
      if (this.failModal.message.toLowerCase().includes("logged in")) {
        this.$router.push({ name: 'Login' });
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    // onImageError is no longer needed here, as the Carousel component handles it internally.
  },
};
</script>

<style scoped>
.car-detail-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  max-width: 1200px; /* Wider card for a better layout */
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
  gap: 40px; /* Add gap between image and details */
}
.image-section {
  flex: 2 1 500px; /* Allow image section to be larger */
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
  text-align: right;
  border-top: 1px solid #e9ecef;
}
.clear-padding{
  padding: 0 !important;
}
.error-container { text-align: center; padding: 40px; }
</style>