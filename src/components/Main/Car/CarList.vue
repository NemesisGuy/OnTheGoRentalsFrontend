<template>
  <div class="content-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>Browse our curated selection of quality vehicles.</p>
    </div>

    <LoadingModal v-if="loading" show :message="loadingMessage"/>

    <!-- Filter and Sort Controls -->
    <div class="controls-container">
      <div class="filter-group date-filter">
        <div class="date-input">
          <label for="start-date">Start Date</label>
          <input type="date" id="start-date" v-model="filters.startDate" :min="today">
        </div>
        <div class="date-input">
          <label for="end-date">End Date</label>
          <input type="date" id="end-date" v-model="filters.endDate" :min="filters.startDate || today">
        </div>
        <button class="button search-button" @click="fetchCars" :disabled="loading || !filters.startDate || !filters.endDate">
          <i class="fas fa-search"></i> Find Cars
        </button>
      </div>

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
      <p v-if="hasSearched">No cars available for the selected dates and filters.</p>
      <p v-else>An unexpected error occurred or no cars are available.</p>
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
          <span class="status-badge status-available">Available</span>
        </div>
        <div class="car-card-body">
          <h3 class="car-title">{{ car.make }} {{ car.model }}</h3>
          <div class="car-meta">
            <span><i class="fas fa-calendar-alt"></i>{{ car.year }}</span>
            <span><i class="fas fa-tags"></i>{{ car.priceGroup }}</span>
          </div>
          <button class="button details-button" @click.stop="viewCarDetails(car.uuid)">
            <i class="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    </div>

    <FailureModal v-if="failModal.show" @close="closeModal" :show="failModal.show" :message="failModal.message"/>
  </div>
</template>

<script>
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";
import defaultCarImage from '@/assets/Images/Defaults/default-car-image.png';

export default {
  name: 'CarList',
  components: { LoadingModal, FailureModal },
  data() {
    return {
      cars: [],
      filters: {
        startDate: '',
        endDate: '',
        priceGroup: null,
      },
      hasSearched: false,
      currentSort: 'make-asc',
      sortColumn: 'make',
      sortDirection: 'asc',
      loading: true,
      loadingMessage: 'Fetching available cars...',
      failModal: { show: false, message: "" },
      defaultCarImage: defaultCarImage,
    };
  },
  computed: {
    today() {
      const d = new Date();
      return d.toISOString().split('T')[0];
    },
    pageTitle() {
      const group = this.filters.priceGroup;
      if (group && group.toLowerCase() !== 'all') {
        return `Available ${this.capitalize(group)} Cars`;
      }
      return 'All Available Cars';
    },
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
  watch: {
    '$route.params.pricegroup'() {
      this.initializeAndFetch();
    }
  },
  created() {
    this.initializeAndFetch();
  },
  methods: {
    initializeAndFetch() {
      this.filters.priceGroup = this.$route.params.pricegroup || 'all';
      this.setDefaultDates();
      this.fetchCars();
    },
    setDefaultDates() {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      this.filters.startDate = today.toISOString().split('T')[0];
      this.filters.endDate = threeDaysFromNow.toISOString().split('T')[0];
    },
    async fetchCars() {
      if (!this.filters.startDate || !this.filters.endDate) {
        this.showFailureModal("Please select both a start and end date.");
        return;
      }
      this.loading = true;
      this.hasSearched = true;
      this.loadingMessage = `Searching for available cars...`;

      try {
        const params = {
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
        };

        if (this.filters.priceGroup && this.filters.priceGroup.toLowerCase() !== 'all') {
          params.priceGroup = this.filters.priceGroup.toUpperCase();
        }

        const response = await api.get('/api/v1/cars/available', { params });
        this.cars = response.data.data || [];
      } catch (error) {
        this.cars = [];
        this.showFailureModal(error.response?.data?.message || `Failed to fetch car data.`);
      } finally {
        this.loading = false;
      }
    },
    updateSort() {
      const [column, direction] = this.currentSort.split('-');
      this.sortColumn = column;
      this.sortDirection = direction;
    },
    viewCarDetails(uuid) {
      this.$router.push({
        name: 'CarDetail',
        params: { uuid: uuid },
        query: {
          startDate: this.filters.startDate,
          endDate: this.filters.endDate
        }
      });
    },
    onImageError(event) { event.target.src = this.defaultCarImage; },
    showFailureModal(message) { this.failModal = { show: true, message: message }; },
    closeModal() { this.failModal.show = false; },
    capitalize(s) {
      if (typeof s !== 'string') return '';
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  },
};
</script>

<style scoped>
.content-container {
  max-width: 1400px;
  margin: auto;
  padding: 2rem;
  background-color: var(--ui-background);
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-weight: 700;
  color: var(--text-primary);
}
.page-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.controls-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--ui-surface);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--ui-shadow);
  margin-bottom: 2.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-input {
  display: flex;
  flex-direction: column;
}
.date-input label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}
.date-input input[type="date"] {
  padding: 0.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  background-color: var(--ui-background);
}

.search-button {
  align-self: flex-end;
  background-color: var(--brand-primary);
  color: var(--text-on-brand);
}
.search-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.sort-control { display: flex; align-items: center; gap: 0.5rem; }
.sort-control select {
  padding: 0.65rem 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  background-color: var(--ui-surface);
}

.car-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.car-card {
  background-color: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px var(--ui-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.car-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
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
}
.status-available { background-color: var(--status-success-bg); color: var(--status-success-fg); border: 1px solid var(--status-success-fg); }
.status-unavailable { background-color: var(--status-danger-bg); color: var(--status-danger-fg); border: 1px solid var(--status-danger-fg); }

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
  color: var(--text-primary);
}

.car-meta {
  display: flex;
  gap: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  background-color: var(--ui-background);
  padding: 0.75rem 1rem;
  border-radius: 6px;
}
.car-meta span {
  display: flex;
  align-items: center;
}
.car-meta i {
  margin-right: 6px;
  color: var(--text-secondary);
}

.details-button {
  width: 100%;
  margin-top: auto;
  background-color: var(--brand-primary);
  color: var(--text-on-brand);
  font-weight: 500;
}

.no-cars-message {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--ui-surface);
  border-radius: 12px;
}
.no-cars-message i { font-size: 3rem; margin-bottom: 1rem; color: var(--brand-primary); }
.no-cars-message p { font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1.5rem; }

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
.back-button-solid {
  background-color: var(--text-secondary);
  color: var(--text-on-brand);
}
</style>