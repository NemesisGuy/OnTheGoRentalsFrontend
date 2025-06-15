<template>
  <div class="content-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>Browse our curated selection of quality vehicles.</p>
    </div>

    <loading-modal v-if="loading" show :message="loadingMessage"/>

    <!-- Filter and Sort Controls -->
    <div v-if="!loading && cars.length > 0" class="controls-container">
      <div class="sort-control">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" v-model="currentSort" @change="updateSort">
          <option value="make-asc">Make (A-Z)</option>
          <option value="make-desc">Make (Z-A)</option>
          <option value="year-desc">Year (Newest First)</option>
          <option value="year-asc">Year (Oldest First)</option>
        </select>
      </div>
    </div>

    <!-- No Cars Message -->
    <div v-if="!loading && cars.length === 0" class="no-cars-message">
      <i class="fas fa-car-crash"></i>
      <p>No cars available matching your criteria.</p>
      <button class="button back-button-solid" @click="goBack"><i class="fas fa-arrow-left"></i> Go Back</button>
    </div>

    <!-- Car Grid Layout -->
    <div v-if="!loading && cars.length > 0" class="car-grid">
      <div v-for="car in sortedCars" :key="car.uuid" class="car-card" @click="viewCarDetails(car.uuid)">
        <div class="car-image-container">
          <img
              :src="car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : defaultCarImage"
              @error="onImageError"
              alt="Car Image"
              class="car-image"
          />
          <span :class="['status-badge', car.available ? 'status-available' : 'status-unavailable']">
            {{ car.available ? 'Available' : 'Rented' }}
          </span>
        </div>
        <div class="car-card-body">
          <h3 class="car-title">{{ car.make }} {{ car.model }}</h3>
          <div class="car-meta">
            <span><span><i class="fas fa-calendar-alt"></i> </span>{{ car.year }}</span>
            <span> <span><i class="fas fa-tags"></i> </span>{{ car.priceGroup }}</span>
          </div>
          <button class="button details-button" @click.stop="viewCarDetails(car.uuid)">
            <i class="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    </div>

    <FailureModal v-if="failModal.show"
                  @close="closeModal"
                  :show="failModal.show"
                  :message="failModal.message"/>
  </div>
</template>

<script>
// The <script> block is unchanged as it was already correct.
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import api from "@/api";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import defaultCarImage from '@/assets/Images/Defaults/default-car-image.png';

export default {
  name: 'CarList',
  components: { LoadingModal, FailureModal },
  data() {
    return {
      cars: [],
      sortColumn: 'make',
      sortDirection: 'asc',
      currentSort: 'make-asc',
      loading: true,
      loadingMessage: 'Fetching cars...',
      failModal: { show: false, message: "" },
      defaultCarImage: defaultCarImage,
      pageTitle: 'Cars'
    };
  },
  mounted() { this.fetchCars(); },
  watch: { '$route'() { this.fetchCars(); } },
  methods: {
    fetchCars() {
      this.loading = true;
      const adminFilter = this.$route.query.filter;
      const priceGroupParam = this.$route.params.pricegroup;
      let endpoint = '';
      let title = 'Cars';
      if (this.$route.name === 'AdminCarList') {
        endpoint = adminFilter === 'available' ? `/api/v1/admin/cars/list/available` : `/api/v1/admin/cars`;
        title = adminFilter === 'available' ? 'Available Cars (Admin)' : 'All Cars (Admin)';
      } else {
        title = 'All Available Cars';
        endpoint = `/api/v1/cars/available`;
        if (priceGroupParam && priceGroupParam.toLowerCase() !== 'all') {
          endpoint = `/api/v1/cars/available/price-group/${priceGroupParam}`;
          title = `Available ${this.capitalize(priceGroupParam)} Cars`;
        }
      }
      this.pageTitle = title;
      this.loadingMessage = `Fetching ${title.toLowerCase()}...`;
      api.get(endpoint)
          .then(response => { this.cars = Array.isArray(response.data) ? response.data : (response.data?.data || []); })
          .catch(error => {
            this.cars = [];
            this.showFailureModal(error.response?.data?.message || `Failed to fetch car data.`);
          })
          .finally(() => this.loading = false);
    },
    updateSort() {
      const [column, direction] = this.currentSort.split('-');
      this.sortColumn = column;
      this.sortDirection = direction;
    },
    viewCarDetails(uuid) {
      const detailRouteName = this.$route.path.includes('/admin/') ? 'AdminCarDetails' : 'CarDetail';
      this.$router.push({ name: detailRouteName, params: { uuid: uuid } });
    },
    onImageError(event) { event.target.src = this.defaultCarImage; },
    showFailureModal(message) { this.failModal = { show: true, message: message }; },
    closeModal() { this.failModal.show = false; },
    goBack() { this.$router.go(-1); },
    capitalize(s) {
      if (typeof s !== 'string') return '';
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  },
  computed: {
    sortedCars() {
      return [...this.cars].sort((a, b) => {
        let valA = a[this.sortColumn] || '';
        let valB = b[this.sortColumn] || '';
        if (this.sortColumn === 'year') {
          return this.sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return this.sortDirection === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    },
  },
};
</script>

<style scoped>
.content-container {
  max-width: 1400px;
  margin: auto;
  padding: 2rem 1rem;
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-weight: 700;
  color: #343a40;
}
.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.controls-container {
  display: flex;
  justify-content: center; /* Centered sort dropdown */
  margin-bottom: 2rem;
}
.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.sort-control select {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background-color: #fff;
}

/* THE FIX: Changed minmax to achieve a 3-column default layout on larger screens */
.car-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.car-card {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.car-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.car-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background-color: #f0f2f5;
}
.car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
}
.status-available { background-color: #28a745; }
.status-unavailable { background-color: #dc3545; }

.car-card-body {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.car-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #343a40;
}

/* THE FIX: New meta box styling to match screenshot */
.car-meta {
  display: flex;
  gap: 1.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}
.car-meta span {
  display: flex;
  align-items: center;
}
.car-meta i {
  margin-right: 6px;
  color: #86909c;
}

.details-button {
  width: 100%;
  margin-top: auto; /* Pushes button to the bottom */
  background-color: #007bff;
  color: white;
  font-weight: 500;
}

.no-cars-message {
  text-align: center;
  padding: 4rem 2rem;
}
.no-cars-message i { font-size: 3rem; margin-bottom: 1rem; color: #007bff; }
.no-cars-message p { font-size: 1.2rem; color: #6c757d; margin-bottom: 1.5rem; }

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.back-button {
  background-color: #6c757d;
  color: white;
}
</style>