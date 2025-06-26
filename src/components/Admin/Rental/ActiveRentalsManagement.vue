<template>
  <div class="active-rentals-container">
    <div class="content-header">
      <h1><i class="fas fa-tasks"></i> Active Rentals Management</h1>
      <p>View and manage all rentals that are currently in progress.</p>
    </div>

    <!-- Controls: Search and Refresh -->
    <div class="controls-bar">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by user, car, email..."
            class="search-input"
        />
      </div>
      <button @click="fetchActiveRentals" class="button refresh-button" :disabled="isLoading" title="Refresh Data">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
      </button>
    </div>

    <!-- Loading State: Skeleton Loader -->
    <div v-if="isLoading" class="rentals-list">
      <div v-for="i in 3" :key="'skeleton-' + i" class="rental-card-skeleton">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="!isLoading && error" class="error-container">
      <p><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
      <button @click="fetchActiveRentals" class="button-retry">Try Again</button>
    </div>

    <!-- Data List -->
    <div v-if="!isLoading && !error" class="rentals-list">
      <div v-if="filteredRentals.length === 0" class="no-data-card">
        <i class="fas fa-info-circle"></i>
        <p v-if="rentals.length > 0">No rentals match your search query.</p>
        <p v-else>There are currently no active rentals.</p>
      </div>

      <!-- Rental Card -->
      <div v-for="rental in filteredRentals" :key="rental.uuid" class="rental-card" @click="viewRentalDetails(rental.uuid)" :class="{ 'is-overdue-card': isOverdue(rental.expectedReturnDate) }">
        <div class="card-main-info">
          <div class="car-details">
            <span class="car-make-model">{{ rental.car.make }} {{ rental.car.model }}</span>
            <span class="license-plate">{{ rental.car.licensePlate }}</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ rental.user.firstName }} {{ rental.user.lastName }}</span>
            <span class="user-email">{{ rental.user.email }}</span>
          </div>
        </div>

        <div class="card-time-info">
          <div class="time-block">
            <span class="time-label">Rental Started</span>
            <span class="time-value">{{ formatDisplayDate(rental.issuedDate) }}</span>
          </div>
          <div class="time-block">
            <span class="time-label">Return Expected</span>
            <span class="time-value">{{ formatDisplayDate(rental.expectedReturnDate) }}</span>
          </div>
        </div>

        <div class="card-status-actions">
          <span :class="['status-badge', getStatusClass(rental)]">
            <i :class="getStatusIcon(rental)"></i>
            {{ getStatusText(rental) }}
          </span>
          <button class="button details-button" @click.stop="viewRentalDetails(rental.uuid)">
            View Details <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// The <script> block is unchanged as it was already correct.
import api from '@/api';
import { formatDate } from '@/utils/dateUtils';

export default {
  name: 'ActiveRentalsManagement',
  data() {
    return {
      rentals: [],
      isLoading: true,
      error: null,
      searchQuery: '',
    };
  },
  computed: {
    filteredRentals() {
      if (!this.searchQuery) {
        return this.rentals;
      }
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return this.rentals.filter(rental => {
        const user = rental.user;
        const car = rental.car;
        return (
            user.firstName.toLowerCase().includes(lowerCaseQuery) ||
            user.lastName.toLowerCase().includes(lowerCaseQuery) ||
            user.email.toLowerCase().includes(lowerCaseQuery) ||
            car.make.toLowerCase().includes(lowerCaseQuery) ||
            car.model.toLowerCase().includes(lowerCaseQuery)
        );
      });
    },
  },
  mounted() {
    this.fetchActiveRentals();
  },
  methods: {
    async fetchActiveRentals() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/api/v1/admin/rentals/active');
        this.rentals = (response.data.data || []).sort((a, b) =>
            new Date(a.expectedReturnDate) - new Date(b.expectedReturnDate)
        );
      } catch (err) {
        this.error = err.response?.data?.errors?.[0]?.message || 'Failed to load active rentals.';
        console.error("Error fetching active rentals:", err);
      } finally {
        this.isLoading = false;
      }
    },
    viewRentalDetails(uuid) {
      this.$router.push({ name: 'ViewRental', params: { uuid: uuid } });
    },
    formatDisplayDate(dateString) {
      return formatDate(dateString, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },
    isOverdue(returnDate) {
      return new Date(returnDate) < new Date();
    },
    getStatusText(rental) {
      if (this.isOverdue(rental.expectedReturnDate)) {
        return 'Overdue';
      }
      return 'Active';
    },
    getStatusIcon(rental) {
      if (this.isOverdue(rental.expectedReturnDate)) {
        return 'fas fa-exclamation-triangle';
      }
      return 'fas fa-check-circle';
    },
    getStatusClass(rental) {
      if (this.isOverdue(rental.expectedReturnDate)) {
        return 'status-overdue';
      }
      return 'status-active';
    },
  },
};
</script>

<style scoped>
.active-rentals-container {
  padding: 2rem;
  background-color: var(--ui-background);
  min-height: 100vh;
}
.content-header {
  text-align: center;
  margin-bottom: 2rem;
}
.content-header h1 {
  font-weight: 700;
  color: var(--text-primary);
}
.content-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.controls-bar {
  display: flex;
  margin-bottom: 2rem;
  gap: 1rem;
}
.search-container {
  position: relative;
  flex-grow: 1;
}
.search-icon {
  position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);
}
.search-input {
  width: 100%; padding: 12px 20px 12px 45px; border-radius: 25px; border: 1px solid var(--ui-border); font-size: 1rem;
}
.search-input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  outline: none;
}
.refresh-button {
  background: var(--ui-surface); border: 1px solid var(--ui-border); width: 45px; height: 45px; border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  color: var(--text-primary);
}

.rentals-list {
  display: grid;
  gap: 1.5rem;
}

.rental-card {
  background-color: var(--ui-surface);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--ui-shadow);
  padding: 1.5rem;
  border-left: 5px solid var(--status-success-fg); /* Default to green for 'Active' */
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.rental-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}
.is-overdue-card {
  border-left-color: var(--status-danger-fg); /* Red border for overdue */
}

.card-main-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--ui-border);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.car-details, .user-details {
  display: flex;
  flex-direction: column;
}
.user-details { text-align: right; }
.car-make-model { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
.license-plate { font-family: 'Courier New', Courier, monospace; background-color: var(--ui-background); padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.9rem; margin-top: 4px; color: var(--text-secondary); }
.user-name { font-weight: 600; color: var(--text-primary); }
.user-email { font-size: 0.9rem; color: var(--text-secondary); }

.card-time-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.time-block { display: flex; flex-direction: column; }
.time-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }
.time-value { font-weight: 600; font-size: 1rem; color: var(--text-primary); }

.card-status-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
}
.status-active { background-color: var(--status-success-bg); color: var(--status-success-fg); }
.status-overdue { background-color: var(--status-danger-bg); color: var(--status-danger-fg); }

.details-button {
  background-color: var(--brand-primary);
  color: var(--text-on-brand);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 600;
}

.no-data-card {
  background-color: var(--ui-surface); text-align: center; padding: 3rem; border-radius: 12px; color: var(--text-secondary);
}
.no-data-card i { font-size: 2.5rem; margin-bottom: 1rem; }

.error-container {
  text-align: center;
  padding: 40px;
  background-color: var(--status-danger-bg);
  color: var(--status-danger-fg);
  border: 1px solid var(--status-danger-fg);
  border-radius: 8px;
}
.button-retry {
  background-color: var(--status-danger-fg);
  color: var(--text-on-brand);
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-top: 1rem;
  cursor: pointer;
}

.rental-card-skeleton {
  background-color: var(--ui-surface); padding: 1.5rem; border-radius: 12px;
}
.skeleton-line { height: 20px; background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%); background-size: 1200px 100%; animation: shimmer 1.8s infinite linear; border-radius: 4px; margin-bottom: 1rem; }
.skeleton-line.title { width: 60%; height: 24px; }
.skeleton-line.medium { width: 80%; }
.skeleton-line.short { width: 40%; }
@keyframes shimmer { 0% { background-position: -1200px 0; } 100% { background-position: 1200px 0; } }
</style>