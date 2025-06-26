<template>
  <div class="staff-operations-dashboard">
    <div class="content-header">
      <h1><i class="fas fa-clipboard-list"></i> Daily Operations</h1>
      <p>Manage today's key tasks for collections, returns, and overdue rentals.</p>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'collections' }" @click="activeTab = 'collections'">
        <i class="fas fa-arrow-circle-down"></i> Collections <span class="tab-count">{{ collectionsDue.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'returns' }" @click="activeTab = 'returns'">
        <i class="fas fa-undo-alt"></i> Returns <span class="tab-count">{{ returnsDue.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'overdue' }" @click="activeTab = 'overdue'">
        <i class="fas fa-exclamation-triangle"></i> Overdue <span class="tab-count">{{ overdueRentals.length }}</span>
      </button>
      <button @click="navigateToActiveRentals" class="navigation-tab">
        <i class="fas fa-tasks"></i> All Active Rentals
      </button>
    </div>

    <LoadingModal v-if="isLoading" :show="true" :message="loadingMessage" />

    <div v-if="apiError" class="error-container">
      <p><i class="fas fa-exclamation-circle"></i> {{ errorMessage || "Failed to load operational data." }}</p>
      <button @click="fetchAllData" class="button-retry">Retry</button>
    </div>

    <!-- TAB CONTENT -->
    <div class="tab-content" v-if="!isLoading && !apiError">
      <!-- Collections Due Today -->
      <div v-if="activeTab === 'collections'" class="operation-section">
        <div v-if="collectionsDue.length === 0" class="no-data-card">No collections due today.</div>
        <div v-else class="cards-grid">
          <div v-for="booking in collectionsDue" :key="booking.uuid" class="operation-card collection-card">
            <div class="card-content">
              <div class="card-title">{{ booking.car?.make }} {{ booking.car?.model }}</div>
              <div class="card-subtitle">For: {{ booking.user?.firstName }} {{ booking.user?.lastName }}</div>
              <div class="card-detail-row">
                <i class="fas fa-clock"></i>
                <span>Collection Time: <strong>{{ formatDateTime(booking.bookingStartDate) }}</strong></span>
              </div>
              <div class="card-detail-row">
                <i class="fas fa-tag"></i>
                <span>Status: <span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span></span>
              </div>
            </div>
            <div class="card-actions">
              <button @click="navigateToCreateRental(booking.uuid)" class="button process-button" :disabled="booking.status !== 'CONFIRMED'">
                <i class="fas fa-play-circle"></i> Start Rental
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Returns Due Today -->
      <div v-if="activeTab === 'returns'" class="operation-section">
        <div v-if="returnsDue.length === 0" class="no-data-card">No returns due today.</div>
        <div v-else class="cards-grid">
          <div v-for="rental in returnsDue" :key="rental.uuid" class="operation-card return-card">
            <div class="card-content">
              <div class="card-title">{{ rental.car?.make }} {{ rental.car?.model }}</div>
              <div class="card-subtitle">Rented by: {{ rental.user?.firstName }} {{ rental.user?.lastName }}</div>
              <div class="card-detail-row">
                <i class="fas fa-flag-checkered"></i>
                <span>Expected Return: <strong>{{ formatDateTime(rental.expectedReturnDate) }}</strong></span>
              </div>
              <div class="card-detail-row">
                <i class="fas fa-tag"></i>
                <span>Status: <span :class="['status-badge', getRentalStatusClass(rental.status)]">{{ formatStatus(rental.status) }}</span></span>
              </div>
            </div>
            <div class="card-actions">
              <button @click="navigateToCompleteRental(rental.uuid)" class="button process-button">
                <i class="fas fa-check-circle"></i> Process Return
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue Rentals -->
      <div v-if="activeTab === 'overdue'" class="operation-section">
        <div v-if="overdueRentals.length === 0" class="no-data-card">No overdue rentals. Well done!</div>
        <div v-else class="cards-grid">
          <div v-for="rental in overdueRentals" :key="rental.uuid" class="operation-card overdue-card">
            <div class="card-content">
              <div class="card-title">{{ rental.car?.make }} {{ rental.car?.model }}</div>
              <div class="card-subtitle">Rented by: {{ rental.user?.firstName }} {{ rental.user?.lastName }}</div>
              <div class="card-detail-row text-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Expected Return: <strong>{{ formatDateTime(rental.expectedReturnDate) }}</strong></span>
              </div>
            </div>
            <div class="card-actions">
              <button @click="viewRentalDetails(rental.uuid)" class="button details-button">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// The <script> block is unchanged as it was already correct.
import api from '@/api';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import { formatDateTime } from '@/utils/dateUtils';

export default {
  name: 'StaffDailyOperations',
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      activeTab: 'collections',
      collectionsDue: [],
      returnsDue: [],
      overdueRentals: [],
      isLoading: false,
      loadingMessage: 'Loading operational data...',
      apiError: false,
      errorMessage: '',
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  created() {
    const defaultTab = this.$route.query.tab;
    if (defaultTab && ['collections', 'returns', 'overdue'].includes(defaultTab)) {
      this.activeTab = defaultTab;
    }
    this.fetchAllData();
  },
  methods: {
    formatDateTime,
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(bookingStatus) {
      if (!bookingStatus) return 'status-unknown';
      return `status-booking-${bookingStatus.toLowerCase().replace(/_/g, '-')}`;
    },
    getRentalStatusClass(rentalStatus) {
      if (!rentalStatus) return 'status-unknown';
      return `status-rental-${rentalStatus.toLowerCase().replace(/_/g, '-')}`;
    },
    async fetchAllData() {
      this.isLoading = true;
      this.apiError = false;
      try {
        const [collections, returns, overdues] = await Promise.allSettled([
          api.get('/api/v1/admin/bookings/collections-due-today'),
          api.get('/api/v1/admin/rentals/returns-due-today'),
          api.get('/api/v1/admin/rentals/overdue-rentals')
        ]);

        this.collectionsDue = collections.status === 'fulfilled' ? collections.value.data.data || [] : [];
        this.returnsDue = returns.status === 'fulfilled' ? returns.value.data.data || [] : [];
        this.overdueRentals = overdues.status === 'fulfilled' ? overdues.value.data.data || [] : [];

        if (collections.status === 'rejected' || returns.status === 'rejected' || overdues.status === 'rejected') {
          this.handleFetchError("Failed to load some operational data.");
        }

      } catch (error) {
        this.handleFetchError("An unexpected error occurred while loading data.");
      } finally {
        this.isLoading = false;
      }
    },
    handleFetchError(defaultMessage) {
      this.apiError = true;
      this.errorMessage = defaultMessage;
    },
    navigateToActiveRentals() {
      this.$router.push({ name: 'ActiveRentalsManagement' });
    },
    navigateToCreateRental(bookingUuid) {
      this.$router.push({ name: 'CreateRental', params: { uuid: bookingUuid } });
    },
    navigateToCompleteRental(rentalUuid) {
      this.$router.push({ name: 'ProcessReturn', params: { uuid: rentalUuid } });
    },
    viewRentalDetails(rentalUuid) {
      this.$router.push({ name: 'ViewRental', params: { uuid: rentalUuid } });
    },
    closeFeedbackModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.apiError = false;
    }
  }
};
</script>

<style scoped>
.staff-operations-dashboard {
  padding: 2rem;
  background-color: var(--ui-background);
}

.content-header {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-secondary);
}
.content-header h1 {
  color: var(--text-primary);
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--ui-border);
  margin-bottom: 2rem;
}
.tabs button {
  padding: 1rem 1.5rem;
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tabs button.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}
.tabs button:hover:not(.active) {
  color: var(--text-primary);
}
.tab-count {
  background-color: var(--ui-border);
  color: var(--text-secondary);
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
}
.tabs button.active .tab-count {
  background-color: var(--brand-primary);
  color: var(--text-on-brand);
}
.navigation-tab {
  margin-left: auto;
}

.operation-section h2 {
  font-size: 1.5rem; color: var(--text-primary);
  margin-bottom: 1.5rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--ui-border);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.operation-card {
  background-color: var(--ui-surface);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--ui-shadow);
  display: flex;
  flex-direction: column;
  border-left: 5px solid;
  overflow: hidden;
}
.collection-card { border-color: var(--status-info-fg); }
.return-card { border-color: var(--status-success-fg); }
.overdue-card { border-color: var(--status-danger-fg); }

.card-content {
  padding: 1.5rem;
  flex-grow: 1;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}
.card-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}
.card-detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.card-detail-row i {
  width: 16px;
  text-align: center;
}
.card-detail-row.text-danger {
  color: var(--status-danger-fg);
  font-weight: bold;
}

.card-actions {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa; /* A slightly different shade for the footer */
  border-top: 1px solid var(--ui-border);
  text-align: right;
}

.no-data-card {
  padding: 3rem; text-align: center; color: var(--text-secondary);
  background-color: var(--ui-surface); border-radius: 12px;
  border: 2px dashed var(--ui-border);
}

.error-container {
  text-align: center; padding: 40px;
  background-color: var(--status-danger-bg);
  color: var(--status-danger-fg);
  border: 1px solid var(--status-danger-fg);
  border-radius: 8px;
}
.retry-button {
  margin-top: 1rem;
  background-color: var(--status-danger-fg);
  color: var(--text-on-brand);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}
.status-booking-confirmed { background-color: var(--status-success-bg); color: var(--status-success-fg); }
.status-rental-active { background-color: var(--status-info-bg); color: var(--status-info-fg); }

.button {
  padding: 10px 18px; border-radius: 8px; font-weight: 600;
  cursor: pointer; border: none;
}
.button.process-button { background-color: var(--brand-primary); color: var(--text-on-brand); }
.button.details-button { background-color: var(--text-secondary); color: var(--text-on-brand); }
.button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>