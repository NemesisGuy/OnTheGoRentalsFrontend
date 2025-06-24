<template>
  <div class="content-container">
    <LoadingModal v-if="loading" show message="Loading car details..."/>

    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h2>Oops! Something went wrong.</h2>
      <p>{{ error }}</p>
      <button class="button back-button-solid" @click="goBack"><i class="fas fa-arrow-left"></i> Go Back</button>
    </div>

    <div v-else-if="car">
      <!-- 1. Page Header -->
      <div class="page-header">
        <h1>{{ car.make }} {{ car.model }}</h1>
        <span class="year-badge">{{ car.year }}</span>
      </div>

      <!-- 2. Main Two-Column Grid Layout -->
      <div class="detail-grid-layout">

        <!-- Left Column: Image -->
        <div class="image-panel">
          <Carousel :images="car.imageUrls" :fallback-image="defaultCarImage" />
        </div>

        <!-- Right Column: Info Panels -->
        <div class="info-panels">

          <!-- Specifications Panel -->
          <div class="panel spec-panel">
            <h3 class="panel-title">Specifications</h3>
            <div class="spec-grid">
              <div class="spec-item">
                <i class="fas fa-tags"></i>
                <div>
                  <strong>Price Group</strong>
                  <span>{{ car.priceGroup }}</span>
                </div>
              </div>
              <div class="spec-item">
                <i class="fas fa-id-card"></i>
                <div>
                  <strong>License Plate</strong>
                  <span class="license-plate">{{ car.licensePlate }}</span>
                </div>
              </div>
              <div class="spec-item">
                <i class="fas fa-check-circle"></i>
                <div>
                  <strong>Status</strong>
                  <span :class="car.available ? 'status-available' : 'status-unavailable'">
                    {{ car.available ? 'Available' : 'Rented' }}
                  </span>
                </div>
              </div>
              <div class="spec-item">
                <i class="fas fa-fingerprint"></i>
                <div>
                  <strong>VIN</strong>
                  <span>{{ car.vin || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Panel -->
          <div class="panel booking-panel">
            <div class="price-info">
              <span class="price-label">Starting From</span>
              <span class="price-amount">R{{ getPrice(car.priceGroup) }}<small>/day</small></span>
            </div>
            <button class="button book-button" @click="bookCar" :disabled="!car.available">
              <i class="fas fa-calendar-plus"></i>
              <span>{{ car.available ? 'Book Now' : 'Unavailable' }}</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Back Button Container -->
      <div class="back-button-container">
        <button class="button back-button" @click="goBack"><i class="fas fa-arrow-left"></i> Back to List</button>
      </div>
    </div>

    <FailureModal v-if="failModal.show"
                  @close="closeFailureModalAndRedirectToLogin"
                  :show="failModal.show"
                  :message="failModal.message"/>
  </div>
</template>

<script>
// The <script> block is unchanged as it was already correct.
import api from "@/api";
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import Carousel from '@/components/Main/Carousel/Carousel.vue';
import defaultCarImage from '@/assets/Images/Defaults/default-car-image.png';

export default {
  name: 'ViewCar',
  components: { LoadingModal, FailureModal, Carousel },
  data() {
    return {
      car: null, loading: true, error: null, defaultCarImage,
      failModal: { show: false, message: "" },
      priceMap: { ECONOMY: 550, STANDARD: 650, LUXURY: 800, PREMIUM: 950, EXOTIC: 1500, SPECIAL: 450, OTHER: 500, NONE: 500 }
    };
  },
  mounted() { this.fetchCarDetails(); },
  methods: {
    fetchCarDetails() {
      const uuid = this.$route.params.uuid;
      if (!uuid) { this.error = "No car specified."; this.loading = false; return; }
      this.loading = true;
      api.get(`/api/v1/cars/${uuid}`)
          .then(response => { this.car = response.data.data || response.data; })
          .catch(err => { this.error = err.response?.data?.message || err.message || "An error occurred."; })
          .finally(() => this.loading = false);
    },
    bookCar() {
      if (!localStorage.getItem('accessToken')) {
        this.failModal = { show: true, message: "You must be logged in to book a car. Redirecting to login..." };
        return;
      }
      this.$router.push({ name: 'CreateBooking', params: { carUuid: this.car.uuid } });
    },
    getPrice(priceGroup) { return this.priceMap[priceGroup] || 'N/A'; },
    closeFailureModalAndRedirectToLogin() {
      this.failModal.show = false;
      if (this.failModal.message.toLowerCase().includes("logged in")) { this.$router.push({ name: 'Login' }); }
    },
    goBack() { this.$router.go(-1); },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #343a40;
}
.page-header .year-badge {
  display: inline-block;
  background-color: #6c757d;
  color: white;
  padding: 5px 15px;
  border-radius: 50px;
  font-weight: 500;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.detail-grid-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: auto;
  align-items: flex-start;
}

/* --- THE FIX IS HERE --- */
.image-panel {
  width: 100%;
  border-radius: 12px;
  /* Removed `overflow: hidden` and `aspect-ratio` to allow the carousel to define its own height */
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}

.info-panels {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.75rem;
}

.spec-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 1rem;
}
.spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.spec-item i {
  font-size: 1.25rem;
  color: #86909c;
  width: 25px;
  text-align: center;
}
.spec-item div { display: flex; flex-direction: column; }
.spec-item strong { font-size: 0.8rem; color: #6c757d; text-transform: uppercase; }
.spec-item span { font-size: 1rem; font-weight: 500; }
.license-plate { font-family: 'Courier New', Courier, monospace; }
.status-available { color: #28a745; font-weight: bold; }
.status-unavailable { color: #dc3545; font-weight: bold; }

.booking-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}
.price-info { line-height: 1.2; }
.price-label { font-size: 0.9rem; color: #6c757d; }
.price-amount { font-size: 1.75rem; font-weight: 700; }
.price-amount small { font-size: 1rem; font-weight: 400; }

.book-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  background-color: #28a745;
  color: white;
  border-radius: 8px;
}
.book-button:disabled { background-color: #6c757d; cursor: not-allowed; }

.back-button-container {
  text-align: center;
  margin-top: 2rem;
}
.back-button {
  background: #6c757d;
  color: white;
  border: none;
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}
.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.error-container { text-align: center; padding: 40px; }
.error-icon { font-size: 3rem; color: #dc3545; margin-bottom: 1rem; }
.back-button-solid { background-color: #6c757d; color: white; border: 1px solid transparent; }

/* Responsive Stacking */
@media (max-width: 992px) {
  .detail-grid-layout {
    grid-template-columns: 1fr; /* Stack columns on tablets and below */
  }
}
@media (max-width: 576px) {
  .spec-grid {
    grid-template-columns: 1fr; /* Stack spec items on small mobile screens */
  }
  .booking-panel {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  .book-button {
    width: 100%;
    justify-content: center;
  }
}
</style>