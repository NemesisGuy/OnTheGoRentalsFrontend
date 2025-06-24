<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h1>
      <div class="header-actions">
        <span class="last-updated">Last updated: {{ lastUpdated.toLocaleTimeString() }}</span>
        <button @click="loadDashboardData" class="refresh-button" :disabled="isLoading" title="Refresh Data">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
        </button>
      </div>
    </div>

    <!-- Skeleton Loader for initial load -->
    <div v-if="isLoading && !chartData.rentals.length" class="dashboard-grid">
      <div class="kpi-card-container">
        <div v-for="i in 5" :key="'kpi-shimmer-' + i" class="kpi-card shimmer-card"></div>
      </div>
      <div class="list-card shimmer-card"></div>
      <div class="list-card shimmer-card"></div>
      <div v-for="i in 5" :key="'chart-shimmer-' + i" class="chart-card shimmer-card"></div>
    </div>

    <!-- Error Display -->
    <div v-if="!isLoading && error" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>Failed to load dashboard data.</p>
      <small>{{ error }}</small>
      <button @click="loadDashboardData" class="button-retry">Try Again</button>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="!isLoading && !error" class="dashboard-grid">
      <!-- KPI Cards Section -->
      <div class="kpi-card-container">
        <router-link :to="{ name: 'ActiveRentalsManagement' }" class="kpi-router-link">
          <div class="kpi-card rentals">
            <i class="fas fa-key kpi-icon"></i>
            <div class="kpi-value">{{ kpis.activeRentals }}</div>
            <div class="kpi-label">Active Rentals</div>
          </div>
        </router-link>
        <router-link :to="{ name: 'AdminCarList', query: { filter: 'available' } }" class="kpi-router-link">
          <div class="kpi-card available">
            <i class="fas fa-car kpi-icon"></i>
            <div class="kpi-value">{{ kpis.availableCars }} / {{ kpis.totalCars }}</div>
            <div class="kpi-label">Available Cars</div>
          </div>
        </router-link>
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
        <router-link :to="{ name: 'FileManagement' }" class="kpi-router-link">
          <div class="kpi-card files">
            <i class="fas fa-hdd kpi-icon"></i>
            <div class="kpi-value">{{ kpis.fileSystemStats?.totalFileCount || 0 }}</div>
            <div class="kpi-label">Files Stored</div>
            <div class="kpi-sub-label">{{ kpis.fileSystemStats?.totalSizeFormatted || '0 B' }}</div>
          </div>
        </router-link>
      </div>

      <!-- Actionable Lists Section -->
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

      <!-- Charts Section -->
      <div class="chart-card rentals-per-day">
        <h3>Rentals Per Day</h3>
        <RentalChart
            v-if="chartData.rentals.length > 0"
            :key="`rental-chart-${lastUpdated.getTime()}`"
            :rentals-data="chartData.rentals" />
        <p v-else class="no-items-message">No rental data for chart.</p>
      </div>

      <div class="chart-card car-popularity">
        <h3>Car Model Popularity</h3>
        <CarPopularityChart
            v-if="chartData.rentals.length > 0"
            :key="`popularity-chart-${lastUpdated.getTime()}`"
            :rentals-data="chartData.rentals"/>
        <p v-else class="no-items-message">No rental data for chart.</p>
      </div>

      <div class="chart-card storage-usage">
        <h3>Storage Usage</h3>
        <StorageUsageChart
            v-if="chartData.storageUsage && Object.keys(chartData.storageUsage).length > 0"
            :key="`storage-chart-${lastUpdated.getTime()}`"
            :storage-data="chartData.storageUsage" />
        <p v-else class="no-items-message">No storage data to display.</p>
      </div>

      <div class="chart-card price-group-pie">
        <h3>Rentals by Price Group</h3>
        <PieChart
            v-if="chartData.rentals.length > 0"
            :key="`pie-chart-${lastUpdated.getTime()}`"
            :rentals-data="chartData.rentals"/>
        <p v-else class="no-items-message">No rental data for chart.</p>
      </div>

      <div class="chart-card rental-durations">
        <h3>Average Rental Duration</h3>
        <RentalDurations
            v-if="chartData.rentals.length > 0"
            :key="`duration-chart-${lastUpdated.getTime()}`"
            :rentals-data="chartData.rentals"/>
        <p v-else class="no-items-message">No rental data for chart.</p>
      </div>
    </div>
  </div>
</template>

<script>
import RentalChart from './Charts/RentalChart.vue';
import CarPopularityChart from './Charts/CarUseChart.vue';
import PieChart from './Charts/PieChart.vue';
import RentalDurations from './Charts/RentalDurations.vue';
import StorageUsageChart from "./Charts/StorageUsageChart.vue";
import { fetchDashboardData } from "@/services/dashboardApi.js";

export default {
  name: "AdminDashboard",
  components: {
    RentalChart,
    CarPopularityChart,
    PieChart,
    RentalDurations,
    StorageUsageChart,
  },
  data() {
    return {
      isLoading: true,
      error: null,
      lastUpdated: new Date(),
      kpis: {
        activeRentals: 0,
        availableCars: 0,
        totalCars: 0,
        overdueRentals: 0,
        fileSystemStats: { totalFileCount: 0, totalSizeFormatted: '0 B' },
      },
      lists: {
        overdueRentals: [],
        collectionsDueToday: [],
      },
      chartData: {
        rentals: [],
        cars: [],
        storageUsage: {},
      },
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
          // This is the most important line for the fix. It updates the timestamp,
          // which changes the `:key` on the chart components, forcing Vue
          // to destroy the old ones and create fresh ones.
          this.lastUpdated = new Date();
        }
      } catch (err) {
        if (this._isMounted) {
          this.error = err.response?.data?.errors?.[0]?.message || err.message || "An unknown error occurred.";
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
.dashboard-container {
  padding: 20px;
  background-color: #f4f7f6;
}
.dashboard-header {
  color: var(--color-text-black);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}
.last-updated {
  color: #6c757d;
  font-style: italic;
}
.refresh-button {
  color: var(--color-text-black);
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
}
.fa-spin {
  animation: fa-spin 1.5s linear infinite;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  grid-template-areas:
    "kpi kpi kpi kpi"
    "overdue overdue collections collections"
    "chart1 chart1 chart2 chart2"
    "chart3 chart4 chart5 chart5";
}
.kpi-card, .list-card, .chart-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.kpi-card-container {
  grid-area: kpi;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.kpi-router-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
}
.kpi-router-link:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}
.kpi-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.kpi-icon { font-size: 2.5rem; margin-bottom: 15px; }
.kpi-value { font-size: 2.2rem; font-weight: bold; }
.kpi-label { font-size: 1rem; }
.kpi-sub-label {
  font-size: 0.9rem;
  font-weight: bold;
  margin-top: 5px;
  color: #ffffff99;
}
.kpi-card.rentals { background-color: var(--color-rentals-bg, #007bff); color: white; }
.kpi-card.available { background-color: var(--color-available-bg, #28a745); color: white; }
.kpi-card.overdue { background-color: var(--color-overdue-bg, #dc3545); color: white; }
.kpi-card.collections { background-color: var(--color-collections-bg, #ffc107); color: var(--bs-white); }
.kpi-card.files { background-color: var(--color-files-bg, #6f42c1); color: white; }

.overdue-list { grid-area: overdue; }
.collections-list { grid-area: collections; }
.rentals-per-day { grid-area: chart1; }
.car-popularity { grid-area: chart2; }
.price-group-pie { grid-area: chart3; }
.storage-usage { grid-area: chart4; }
.rental-durations { grid-area: chart5; }

.list-card, .chart-card { min-height: 350px;
color: var(--color-text-black)}
.chart-card h3 { text-align: center; margin-top: 0; }
.list-card h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.list-card ul { list-style: none; padding: 0; }
.list-card li { display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid #f0f0f0; }
.list-card li.clickable:hover { background-color: #f8f9fa; cursor: pointer; }
.car-info { font-weight: bold; }
.user-info { color: #555; font-size: 0.85rem; }
.due-date { font-weight: bold; }
.due-date.overdue { color: #dc3545; }
.due-date.collections { color: #28a745; }
.no-items-message { display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-style: italic; }
.no-items-message i { font-size: 2rem; margin-right: 10px; }
.error-container { text-align: center; padding: 40px; background: #fff3f3; color: #dc3545; border-radius: 12px; }
.shimmer-card { background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%); background-size: 1200px 100%; animation: shimmer 1.8s infinite linear; }
@keyframes shimmer { 0% { background-position: -1200px 0; } 100% { background-position: 1200px 0; } }

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "kpi kpi"
      "overdue collections"
      "chart1 chart2"
      "chart3 chart4"
      "chart5 chart5";
  }
}
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "kpi" "overdue" "collections" "chart1" "chart2" "chart3" "chart4" "chart5";
  }
}
</style>