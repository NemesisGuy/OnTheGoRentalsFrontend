<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h1>
      <div class="header-actions">
        <span class="last-updated">Last updated: {{ lastUpdated }}</span>
        <button @click="loadDashboardData" class="refresh-button" :disabled="isLoading" title="Refresh Data">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
        </button>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="dashboard-grid">
      <div class="kpi-card-container">
        <div v-for="i in 4" :key="'kpi-shimmer-' + i" class="kpi-card shimmer-card"></div>
      </div>
      <div class="list-card shimmer-card"></div>
      <div class="list-card shimmer-card"></div>
      <div v-for="i in 4" :key="'chart-shimmer-' + i" class="chart-card shimmer-card"></div>
    </div>

    <!-- Error Display -->
    <div v-if="!isLoading && error" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="button-retry">Try Again</button>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="!isLoading && !error" class="dashboard-grid">
      <!-- Clickable KPI Cards -->
      <div class="kpi-card-container">
        <!-- This link goes to the dedicated management page -->
        <router-link :to="{ name: 'ActiveRentalsManagement' }" class="kpi-router-link">
          <div class="kpi-card rentals">
            <i class="fas fa-key kpi-icon"></i>
            <div class="kpi-value">{{ kpis.activeRentals }}</div>
            <div class="kpi-label">Active Rentals</div>
          </div>
        </router-link>

        <!-- This link goes to the car list page with a filter -->
        <router-link :to="{ name: 'AdminCarList', query: { filter: 'available' } }" class="kpi-router-link">
          <div class="kpi-card available">
            <i class="fas fa-car kpi-icon"></i>
            <div class="kpi-value">{{ kpis.availableCars }} / {{ kpis.totalCars }}</div>
            <div class="kpi-label">Available Cars</div>
          </div>
        </router-link>

        <!-- *** THE FIX IS HERE *** -->
        <!-- These links now point to StaffDailyOperations with a query parameter -->
        <router-link :to="{ name: 'StaffDailyOperations', query: { tab: 'overdue' } }" class="kpi-router-link">
          <div class="kpi-card overdue">
            <i class="fas fa-exclamation-triangle kpi-icon"></i>
            <div class="kpi-value">{{ kpis.overdueRentals }}</div>
            <div class="kpi-label">Overdue Rentals</div>
          </div>
        </router-link>

        <router-link :to="{ name: 'StaffDailyOperations', query: { tab: 'collections' } }" class="kpi-router-link">
          <div class="kpi-card collections">
            <i class="fas fa-calendar-check kpi-icon"></i>
            <div class="kpi-value">{{ lists.collectionsDueToday.length }}</div>
            <div class="kpi-label">Collections Today</div>
          </div>
        </router-link>
        <!-- *** END OF FIX *** -->

      </div>

      <!-- Actionable Lists (unchanged) -->
      <div class="list-card overdue-list">
        <h3><i class="fas fa-clock"></i> Overdue Rentals</h3>
        <ul v-if="lists.overdueRentals.length > 0">
          <li v-for="rental in lists.overdueRentals" :key="rental.uuid" @click="viewRental(rental.uuid)" class="clickable">
            <div>
              <span class="car-info">{{ rental.car.make }} {{ rental.car.model }}</span>
              <span class="user-info">by {{ rental.user.firstName }}</span>
            </div>
            <span class="due-date overdue">Due: {{ formatDate(rental.expectedReturnDate) }}</span>
          </li>
        </ul>
        <p v-else class="no-items-message"><i class="fas fa-check-circle"></i> No overdue rentals.</p>
      </div>

      <div class="list-card collections-list">
        <h3><i class="fas fa-car-side"></i> Collections Due Today</h3>
        <ul v-if="lists.collectionsDueToday.length > 0">
          <li v-for="booking in lists.collectionsDueToday" :key="booking.uuid" @click="viewBooking(booking.uuid)" class="clickable">
            <div>
              <span class="car-info">{{ booking.car.make }} {{ booking.car.model }}</span>
              <span class="user-info">for {{ booking.user.firstName }}</span>
            </div>
            <span class="due-date collections">From: {{ formatTime(booking.startDate) }}</span>
          </li>
        </ul>
        <p v-else class="no-items-message"><i class="fas fa-coffee"></i> No collections due today.</p>
      </div>

      <!-- Charts (unchanged) -->
      <div class="chart-card rentals-per-day"><h3 >Rentals Per Day</h3><RentalChart :rentals-data="chartData.rentals" /></div>
      <div class="chart-card car-popularity"><h3 >Car Model Popularity</h3><CarPopularityChart :rentals-data="chartData.rentals"/></div>
      <div class="chart-card price-group-pie"><h3 >Rentals by Price Group</h3><PieChart :rentals-data="chartData.rentals"/></div>
      <div class="chart-card rental-durations"><h3 >Average Rental Duration</h3><RentalDurations :rentals-data="chartData.rentals"/></div>
    </div>
  </div>
</template>

<script>
// The script section is exactly the same as before. No changes needed here.
import RentalChart from './Charts/RentalChart.vue'
import CarPopularityChart from './Charts/CarUseChart.vue'
import PieChart from './Charts/PieChart.vue'
import RentalDurations from "./Charts/RentalDurations.vue";
import { fetchDashboardData } from "@/services/dashboardApi.js";

export default {
  name: "AdminDashboard",
  components: { RentalChart, CarPopularityChart, PieChart, RentalDurations },
  data() {
    return {
      isLoading: true,
      error: null,
      lastUpdated: 'never',
      kpis: { activeRentals: 0, availableCars: 0, totalCars: 0, overdueRentals: 0 },
      lists: { overdueRentals: [], collectionsDueToday: [] },
      chartData: { rentals: [], cars: [] },
      _isMounted: false,
    };
  },
  mounted() {
    this._isMounted = true;
    this.loadDashboardData();
  },
  beforeUnmount() {
    this._isMounted = false;
  },
  methods: {
    async loadDashboardData() {
      this.isLoading = true;
      this.error = null;
      try {
        const dashboardData = await fetchDashboardData();
        if (this._isMounted) {
          this.kpis = dashboardData.kpis;
          this.lists = dashboardData.lists;
          this.chartData = dashboardData.chartData;
          this.lastUpdated = new Date().toLocaleTimeString();
        }
      } catch (err) {
        if (this._isMounted) {
          this.error = err.message || "Failed to load dashboard data.";
          console.error("Dashboard Error:", err);
        }
      } finally {
        if (this._isMounted) {
          this.isLoading = false;
        }
      }
    },
    viewRental(rentalUuid) {
      this.$router.push({ name: 'AdminRentalDetails', params: { uuid: rentalUuid } });
    },
    viewBooking(bookingUuid) {
      this.$router.push({ name: 'AdminViewBooking', params: { uuid: bookingUuid } });
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },
    formatTime(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style scoped>
/* All styles are exactly the same as before. No changes needed here. */
.dashboard-container { padding: 20px; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.dashboard-header h1 { color: #333; font-size: 1.8rem; }
.header-actions { display: flex; align-items: center; gap: 15px; }
.last-updated { color: #666; font-style: italic; font-size: 0.9rem; }
.refresh-button { background: #fff; border: 1px solid #ccc; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.refresh-button:hover { background: #007bff; color: white; border-color: #007bff; }
.refresh-button:disabled { cursor: not-allowed; opacity: 0.7; }
.fa-spin { animation: fa-spin 1.5s linear infinite; }
.dashboard-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.kpi-router-link { text-decoration: none; color: inherit; display: block; transition: transform 0.2s ease, box-shadow 0.2s ease; border-radius: 12px; }
.kpi-router-link:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
.kpi-card, .list-card, .chart-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: #333; height: 100%; }
.kpi-card-container { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.kpi-icon { font-size: 2.5rem; margin-bottom: 15px; }
.kpi-value { font-size: 2.2rem; font-weight: bold; }
.kpi-label { font-size: 1rem; color: #555; }
.kpi-card.rentals .kpi-icon { color: #007bff; }
.kpi-card.available .kpi-icon { color: #28a745; }
.kpi-card.overdue .kpi-icon { color: #dc3545; }
.kpi-card.collections .kpi-icon { color: #ffc107; }
.list-card { min-height: 350px; overflow-y: auto; min-width: 360px; }
.list-card h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.list-card ul { list-style: none; padding: 0; margin: 0; }
.list-card li { display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid #f0f0f0; }
.list-card li.clickable { cursor: pointer; transition: background-color 0.2s ease; }
.list-card li.clickable:hover { background-color: #f8f9fa; }
.car-info { font-weight: bold; }
.user-info { color: #555; font-size: 0.85rem; }
.due-date { font-weight: bold; text-align: right; }
.due-date.overdue { color: #dc3545; }
.due-date.collections { color: #28a745; }
.no-items-message { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80%; color: #888; text-align: center; }
.no-items-message i { font-size: 2.5rem; margin-bottom: 15px; color: #ccc; }
.chart-card { min-height: 400px; display: flex; flex-direction: column; }
.chart-card h3 { margin-top: 0; text-align: center; padding-bottom: 10px; }
.error-container { text-align: center; padding: 50px; background: #fff3f3; color: #dc3545; border-radius: 12px; }
.error-container .error-icon { font-size: 3rem; margin-bottom: 1rem; }
.button-retry { background-color: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 1rem; }
.shimmer-card { background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%); background-size: 1200px 100%; animation: shimmer 1.8s infinite linear; }
@keyframes shimmer { 0% { background-position: -1200px 0; } 100% { background-position: 1200px 0; } }
@media (max-width: 1200px) { .dashboard-grid { grid-template-columns: repeat(2, 1fr); } .kpi-card-container { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .dashboard-grid, .kpi-card-container { grid-template-columns: 1fr; } .dashboard-header { flex-direction: column; align-items: flex-start; gap: 10px; } }
</style>