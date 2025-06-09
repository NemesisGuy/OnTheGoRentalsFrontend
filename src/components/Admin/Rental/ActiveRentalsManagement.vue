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
            placeholder="Search by user, car, email, license plate..."
            class="search-input"
        />
      </div>
      <button @click="fetchActiveRentals" class="button refresh-button text-bg-light" :disabled="isLoading" title="Refresh Data">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
      </button>
    </div>

    <!-- Loading State: Skeleton Loader -->
    <div v-if="isLoading" class="table-container">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton-cell" v-for="j in 6" :key="j"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="!isLoading && error" class="error-container">
      <p><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
      <button @click="fetchActiveRentals" class="button-retry">Try Again</button>
    </div>

    <!-- Data Table -->
    <div v-if="!isLoading && !error" class="table-container">
      <table class="rentals-table">
        <thead>
        <tr>
          <th>User</th>
          <th>Car</th>
          <th>License Plate</th>
          <th>Rental Started</th>
          <th>Return Expected</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredRentals.length === 0">
          <td colspan="7" class="no-data-cell">
            <p v-if="searchQuery">No rentals match your search query.</p>
            <p v-else>There are currently no active rentals.</p>
          </td>
        </tr>
        <tr v-for="rental in filteredRentals" :key="rental.uuid" @click="viewRentalDetails(rental.uuid)" class="clickable-row">
          <td>
            <div class="user-info">
              {{ rental.user.firstName }} {{ rental.user.lastName }}
              <span>{{ rental.user.email }}</span>
            </div>
          </td>
          <td>{{ rental.car.make }} {{ rental.car.model }}</td>
          <td><span class="license-plate">{{ rental.car.licensePlate }}</span></td>
          <td>{{ formatDisplayDate(rental.issuedDate) }}</td>
          <td>{{ formatDisplayDate(rental.expectedReturnDate) }}</td>
          <td>
              <span :class="['status-badge', getStatusClass(rental.status)]">
                {{ formatStatus(rental.status) }}
              </span>
          </td>
          <td>
            <button class="button details-button" @click.stop="viewRentalDetails(rental.uuid)">
              <i class="fas fa-eye"></i> Details
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
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
            car.model.toLowerCase().includes(lowerCaseQuery) ||
            car.licensePlate.toLowerCase().includes(lowerCaseQuery)
        );
      });
    },
  },
  mounted() {
    this.fetchActiveRentals();
  },
  methods: {
    /**
     * This method correctly calls the single source of truth for active rentals.
     */
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
    viewRentalDetails(rentalUuid) {
      this.$router.push({ name: 'ViewRental', params: { uuid: rentalUuid } });
    },
    formatDisplayDate(dateString) {
      return formatDate(dateString);
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-rental-${status.toLowerCase().replace(/_/g, '-')}`;
    },
  },
};
</script>

<style scoped>
/* All styles are unchanged */
.active-rentals-container { padding: 20px; background-color: #f8f9fa; }
.content-header { margin-bottom: 20px; }
.content-header h1 { font-size: 1.8rem; }
.content-header p { color: #6c757d; }
.controls-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.search-container { position: relative; width: 50%; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #adb5bd; }
.search-input { width: 100%; padding: 10px 15px 10px 40px; border-radius: 20px; border: 1px solid #ced4da; transition: border-color 0.2s, box-shadow 0.2s; }
.search-input:focus { border-color: #80bdff; box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); outline: none; }
.refresh-button { background: none; border: 1px solid #ccc; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; }
.fa-spin { animation: fa-spin 1.5s linear infinite; }
.table-container { background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto; }
.rentals-table { width: 100%; border-collapse: collapse; }
.rentals-table th, .rentals-table td { padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; }
.rentals-table th { background-color: #f8f9fa; font-weight: 600; color: #495057; }
.clickable-row { color: var(--bs-black); cursor: pointer; transition: background-color 0.2s ease; }
.clickable-row:hover { background-color: #f1f3f5; }
.user-info span { display: block; font-size: 0.85rem; color: #6c757d; }
.license-plate { font-family: 'Courier New', Courier, monospace; background-color: #e9ecef; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.status-badge { padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; color: #fff; }
.status-rental-active { background-color: #17a2b8; }
.status-unknown { background-color: #6c757d; }
.no-data-cell { text-align: center; padding: 40px; font-size: 1.1rem; color: #6c757d; font-style: italic; }
.error-container { text-align: center; padding: 40px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 8px; }
.button-retry { background-color: #721c24; color: white; border: none; }
.skeleton-row { display: flex; padding: 15px; border-bottom: 1px solid #dee2e6; }
.skeleton-cell { height: 20px; background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%); background-size: 1200px 100%; animation: shimmer 1.8s infinite linear; border-radius: 4px; flex: 1; margin-right: 15px; }
.skeleton-cell:last-child { margin-right: 0; }
@keyframes shimmer { 0% { background-position: -1200px 0; } 100% { background-position: 1200px 0; } }
</style>