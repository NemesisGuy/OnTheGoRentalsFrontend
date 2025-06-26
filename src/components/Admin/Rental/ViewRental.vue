<template>
  <div class="content-container">
    <div v-if="loading" class="loading-container">
      <div class="shimmer-card"></div>
    </div>

    <div v-else-if="error" class="error-container">
      <p><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
      <button class="button back-button" @click="goBack">Go Back</button>
    </div>

    <div v-else-if="rental" class="rental-details-card">
      <!-- Card Header -->
      <div class="card-header">
        <div class="header-info">
          <h2>{{ rental.car.make }} {{ rental.car.model }}</h2>
          <p class="rental-uuid">Rental ID: {{ rental.uuid }}</p>
        </div>
        <!-- === NEW DUE STATUS BADGE === -->
        <div :class="['due-status-badge', getDueStatus(rental).class]">
          <i :class="getDueStatus(rental).icon"></i>
          <span>{{ getDueStatus(rental).text }}</span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <div class="details-section">
          <h3><i class="fas fa-file-alt"></i> Rental Terms</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Status:</label> <span :class="['status-badge', getStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></div>
            <div class="detail-item"><label>Issued Date:</label> <span>{{ formatDateTime(rental.issuedDate) }}</span></div>
            <div class="detail-item"><label>Expected Return:</label> <span>{{ formatDateTime(rental.expectedReturnDate) }}</span></div>
            <div v-if="rental.returnedDate" class="detail-item"><label>Actual Return:</label> <span>{{ formatDateTime(rental.returnedDate) }}</span></div>
            <div class="detail-item"><label>Fine:</label> <span>R{{ rental.fine?.toFixed(2) || '0.00' }}</span></div>
          </div>
        </div>

        <div class="details-section">
          <h3><i class="fas fa-user-circle"></i> Customer & Driver</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Full Name:</label> <span>{{ rental.user.firstName }} {{ rental.user.lastName }}</span></div>
            <div class="detail-item"><label>Email:</label> <span>{{ rental.user.email }}</span></div>
            <div v-if="rental.driver" class="detail-item"><label>Assigned Driver:</label> <span>{{ rental.driver.firstName }} {{ rental.driver.lastName }}</span></div>
            <div v-else class="detail-item"><label>Assigned Driver:</label> <span>None</span></div>
          </div>
        </div>

        <div class="details-section">
          <h3><i class="fas fa-car"></i> Car Details</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>Make & Model:</label> <span>{{ rental.car.make }} {{ rental.car.model }}</span></div>
            <div class="detail-item"><label>Year:</label> <span>{{ rental.car.year }}</span></div>
            <div class="detail-item"><label>License Plate:</label> <span>{{ rental.car.licensePlate }}</span></div>
          </div>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <button class="button back-button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        <button v-if="rental.status === 'ACTIVE'" @click="navigateToProcessReturn(rental.uuid)" class="button process-button">
          <i class="fas fa-check-circle"></i> Process Return
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime } from '@/utils/dateUtils.js';
import ShimmerCard from "@/components/Main/Loaders/ShimmerCard.vue";

export default {
  name: 'ViewRental',
  components: { ShimmerCard },
  data() {
    return {
      rental: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchRentalDetails();
  },
  methods: {
    formatDateTime,
    async fetchRentalDetails() {
      this.loading = true;
      this.error = null;
      const rentalId = this.$route.params.uuid;
      try {
        const response = await api.get(`/api/v1/admin/rentals/${rentalId}`);
        if (response.data?.status === 'success' && response.data.data) {
          this.rental = response.data.data;
        } else {
          throw new Error("Rental data could not be loaded or was not found.");
        }
      } catch (err) {
        this.error = err.response?.data?.message || "An error occurred while fetching rental details.";
        console.error("Error fetching rental profile:", err);
      } finally {
        this.loading = false;
      }
    },
    navigateToProcessReturn(rentalUuid) {
      this.$router.push({ name: 'ProcessReturn', params: { uuid: rentalUuid } });
    },
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-rental-${status.toLowerCase().replace(/_/g, '-')}`;
    },
    // --- NEW METHOD TO DETERMINE DUE STATUS ---
    getDueStatus(rental) {
      const now = new Date();
      const returnDate = new Date(rental.expectedReturnDate);

      // Check if today (ignoring time)
      const isToday = returnDate.getFullYear() === now.getFullYear() &&
          returnDate.getMonth() === now.getMonth() &&
          returnDate.getDate() === now.getDate();

      if (rental.status !== 'ACTIVE') {
        return { text: 'Archived', class: 'due-status-inactive', icon: 'fas fa-archive' };
      }
      if (returnDate < now) {
        return { text: 'Overdue', class: 'due-status-overdue', icon: 'fas fa-exclamation-triangle' };
      }
      if (isToday) {
        return { text: 'Due Today', class: 'due-status-today', icon: 'fas fa-clock' };
      }
      return { text: 'Active', class: 'due-status-active', icon: 'fas fa-check-circle' };
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem;
  background-color: var(--ui-background);
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.rental-details-card {
  max-width: 1000px;
  margin: auto;
  background: var(--ui-surface);
  border-radius: 16px;
  box-shadow: 0 8px 40px var(--ui-shadow);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid var(--ui-border);
}
.header-info h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-primary);
}
.header-info .rental-uuid {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.due-status-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1rem;
}
.due-status-active { background-color: var(--status-success-bg); color: var(--status-success-fg); }
.due-status-overdue { background-color: var(--status-danger-bg); color: var(--status-danger-fg); }
.due-status-today { background-color: var(--status-warning-bg); color: var(--status-warning-fg); }
.due-status-inactive { background-color: #e9ecef; color: var(--text-secondary); }

.card-body {
  padding: 2rem;
}
.details-section {
  margin-bottom: 2rem;
}
.details-section:last-of-type {
  margin-bottom: 0;
}
.details-section h3 {
  font-size: 1.2rem;
  color: var(--brand-primary);
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--brand-primary);
  display: inline-block;
}
.details-section h3 i { margin-right: 0.75rem; }

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.detail-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.detail-item span {
  font-size: 1rem;
  color: var(--text-primary);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-on-brand);
  text-transform: capitalize;
  display: inline-block;
  width: fit-content;
}
.status-rental-active { background-color: var(--status-info-fg); }
.status-rental-completed { background-color: var(--text-secondary); }
.status-rental-cancelled { background-color: var(--status-danger-fg); }
.status-unknown { background-color: #adb5bd; }

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid var(--ui-border);
}

.button {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.back-button {
  background-color: var(--text-secondary);
  color: var(--text-on-brand);
}
.process-button {
  background-color: var(--status-success-fg);
  color: var(--text-on-brand);
}

.loading-container {
  max-width: 900px;
  margin: auto;
}
.error-container {
  text-align: center;
  padding: 40px;
  background-color: var(--status-danger-bg);
  color: var(--status-danger-fg);
  border: 1px solid var(--status-danger-fg);
  border-radius: 8px;
  max-width: 900px;
  margin: auto;
}
</style>