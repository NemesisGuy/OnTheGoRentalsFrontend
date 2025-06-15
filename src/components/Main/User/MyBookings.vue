<template>
  <div class="content-container">
    <LoadingModal v-if="isLoading" :show="true" message="Fetching your bookings..." />

    <div class="page-header">
      <h1><i class="fas fa-calendar-alt"></i> My Bookings</h1>
      <p>Here you can view and manage your upcoming and past bookings.</p>
    </div>

    <div v-if="!isLoading && bookings.length === 0" class="no-bookings-container">
      <div class="no-bookings-card">
        <i class="fas fa-car-side empty-icon"></i>
        <h2>You have no bookings yet.</h2>
        <p>Ready to hit the road? Find the perfect car for your next adventure.</p>
        <router-link :to="{ name: 'CarList', params: { pricegroup: 'all' } }" class="button find-car-button">
          <i class="fas fa-search"></i> Find a Car to Rent
        </router-link>
      </div>
    </div>

    <div v-if="!isLoading && bookings.length > 0" class="bookings-grid">
      <div v-for="booking in sortedBookings" :key="booking.uuid" class="booking-card">
        <div class="booking-card-header">
          <h3 class="car-title">{{ booking.car?.make || 'Car' }} {{ booking.car?.model || 'Details Unavailable' }}</h3>
          <span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span>
        </div>
        <div class="booking-card-body">
          <div class="detail-grid">
            <div class="detail-item">
              <i class="fas fa-calendar-check"></i>
              <div>
                <strong>Collection</strong>
                <span>{{ formatDisplayDateTime(booking.bookingStartDate) }}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="fas fa-calendar-times"></i>
              <div>
                <strong>Return</strong>
                <span>{{ formatDisplayDateTime(booking.bookingEndDate) }}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="fas fa-id-card"></i>
              <div>
                <strong>License Plate</strong>
                <span>{{ booking.car?.licensePlate || 'N/A' }}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="fas fa-receipt"></i>
              <div>
                <strong>Booking ID</strong>
                <span>{{ booking.uuid ? booking.uuid.substring(0, 8) : 'N/A' }}...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="booking-card-footer">
          <span v-if="!canCancelBooking(booking.status)" class="action-disabled-note">
            This booking can no longer be cancelled.
          </span>
          <button
              v-else
              @click="initiateCancelBooking(booking)"
              class="button cancel-button"
              :disabled="isCancelling === booking.uuid"
          >
            <i class="fas fa-times-circle"></i>
            {{ isCancelling === booking.uuid ? 'Cancelling...' : 'Cancel Booking' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmationModal
        key="cancelConfirmModal"
        :show="showCancelConfirmModal"
        title="Confirm Cancellation"
        @cancel="closeCancelConfirmModal"
        @confirm="confirmCancellation"
    >
      <template #default>
        <p>Are you sure you want to cancel this booking?</p>
        <div v-if="bookingToCancel && bookingToCancel.car" class="confirm-details">
          <p><strong>Car:</strong> {{ bookingToCancel.car.make }} {{ bookingToCancel.car.model }}</p>
          <p><strong>Collection:</strong> {{ formatDisplayDateTime(bookingToCancel.bookingStartDate) }}</p>
        </div>
        <p class="text-danger">This action cannot be undone.</p>
      </template>
    </ConfirmationModal>

    <FailureModal :message="failModal.message" :show="failModal.show" @close="closeFailModal" />
    <SuccessModal :message="successModal.message" :show="successModal.show" @close="closeSuccessModalAndRefresh" />
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import ConfirmationModal from '@/components/Main/Modals/ConfirmationModal.vue';
import { formatDateTime } from '@/utils/dateUtils';

export default {
  name: 'MyBookings',
  components: { LoadingModal, FailureModal, SuccessModal, ConfirmationModal },
  data() {
    return {
      bookings: [],
      isLoading: false,
      isCancelling: null,
      failModal: { show: false, message: '' },
      successModal: { show: false, message: '' },
      showCancelConfirmModal: false,
      bookingToCancel: null,
      bookingStatuses: {
        PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
        CONFIRMED: 'CONFIRMED',
        RENTAL_INITIATED: 'RENTAL_INITIATED',
        USER_CANCELLED: 'USER_CANCELLED',
        ADMIN_CANCELLED: 'ADMIN_CANCELLED',
        REJECTED: 'REJECTED',
        NO_SHOW: 'NO_SHOW',
        FULFILLED: 'FULFILLED'
      }
    };
  },
  computed: {
    sortedBookings() {
      return [...this.bookings].sort((a, b) => new Date(b.bookingStartDate) - new Date(a.bookingStartDate));
    }
  },
  async mounted() {
    await this.fetchUserBookings();
  },
  methods: {
    formatDisplayDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A';
      return formatDateTime(dateTimeString);
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-${status.toLowerCase().replace(/_/g, '-')}`;
    },
    async fetchUserBookings() {
      this.isLoading = true;
      try {
        const response = await api.get('/api/v1/bookings/my-bookings');
        this.bookings = response.data?.data || [];
      } catch (error) {
        this.failModal = {
          show: true,
          message: error.response?.data?.message || 'Failed to fetch bookings.'
        };
        if (error.response?.status === 401 || error.response?.status === 403)
          this.$router.push({ name: 'Login' });
      } finally {
        this.isLoading = false;
      }
    },
    canCancelBooking(status) {
      return (
          status === this.bookingStatuses.CONFIRMED ||
          status === this.bookingStatuses.PENDING_CONFIRMATION
      );
    },
    initiateCancelBooking(booking) {
      this.bookingToCancel = booking;
      this.showCancelConfirmModal = true;
    },
    closeCancelConfirmModal() {
      this.showCancelConfirmModal = false;
      this.bookingToCancel = null;
    },
    async confirmCancellation() {
      if (!this.bookingToCancel) return;
      this.isCancelling = this.bookingToCancel.uuid;
      try {
        await api.post(`/api/v1/bookings/${this.bookingToCancel.uuid}/cancel`);
        this.successModal = { show: true, message: 'Booking successfully cancelled!' };
      } catch (error) {
        this.failModal = {
          show: true,
          message: error.response?.data?.message || 'Failed to cancel booking.'
        };
      } finally {
        this.isCancelling = null;
        this.closeCancelConfirmModal();
      }
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    closeSuccessModalAndRefresh() {
      this.successModal.show = false;
      this.fetchUserBookings();
    }
  }
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
  font-weight: 700;
  color: #343a40;
}
.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.no-bookings-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}
.no-bookings-card {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  max-width: 600px;
}
.empty-icon {
  font-size: 3.5rem;
  color: #007bff;
  margin-bottom: 1.5rem;
}
.no-bookings-card h2 {
  font-weight: 600;
  color: #343a40;
}
.no-bookings-card p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}
.find-car-button {
  background-color: #007bff;
  color: white;
}

.bookings-grid {
  display: grid;
  gap: 1.5rem;
  max-width: 1200px;
  margin: auto;
}

/* Responsive layout: 3, 2, 1 columns */
@media (min-width: 1200px) {
  .bookings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 768px) and (max-width: 1199px) {
  .bookings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 767px) {
  .bookings-grid {
    grid-template-columns: 1fr;
  }
}

.booking-card {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.booking-card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  background-color: #f8f9fa;
}
.car-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
}
.status-badge {
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
}
.status-pending-confirmation {
  background-color: #ffc107;
  color: #333;
}
.status-confirmed {
  background-color: #28a745;
}
.status-rental-initiated,
.status-fulfilled {
  background-color: #007bff;
}
.status-user-cancelled,
.status-admin-cancelled,
.status-rejected {
  background-color: #dc3545;
}
.status-no-show {
  background-color: #fd7e14;
}
.status-unknown {
  background-color: #6c757d;
}

.booking-card-body {
  padding: 1.5rem;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 576px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.detail-item i {
  font-size: 1.25rem;
  color: #007bff;
  width: 25px;
  text-align: center;
}
.detail-item div {
  display: flex;
  flex-direction: column;
}
.detail-item strong {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
}
.detail-item span {
  font-size: 1rem;
  font-weight: 500;
  color: #343a40;
}

.booking-card-footer {
  margin-top: auto;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  text-align: right;
}
.cancel-button {
  background-color: #dc3545;
  color: white;
}
.cancel-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}
.action-disabled-note {
  font-size: 0.9rem;
  color: #6c757d;
  font-style: italic;
}
.confirm-details p {
  margin: 0.5rem 0;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
}
.text-danger {
  color: #dc3545 !important;
}
.button {
  padding: 8px 15px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
