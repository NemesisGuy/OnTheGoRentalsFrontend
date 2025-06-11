<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="isLoading" :show="true" message="Loading booking details..."/>

      <div v-if="!isLoading && booking && user && car" class="booking-profile">
        <div class="form-header">
          <h1><i class="fas fa-calendar-check"></i> View Booking</h1>
          <p class="sub-header">Booking UUID: {{ booking.uuid }}</p>
        </div>
        <hr/>

        <div class="profile-details">
          <!-- Booking Details -->
          <div class="section">
            <h3><i class="fas fa-calendar-check"></i> Booking Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Status:</label> <span :class="['status-badge', getStatusClass(booking.status)]">{{ formatStatus(booking.status) }}</span></div>
              <div class="detail-item"><label>Collection Date:</label> <span>{{ formatDateTime(booking.bookingStartDate) }}</span></div>
              <div class="detail-item"><label>Expected Return:</label> <span>{{ formatDateTime(booking.bookingEndDate) }}</span></div>
              <div v-if="booking.returnedDate" class="detail-item"><label>Actual Return:</label> <span>{{ formatDateTime(booking.returnedDate) }}</span></div>
              <div v-if="booking.fine > 0" class="detail-item"><label>Fine:</label> <span>${{ booking.fine.toFixed(2) }}</span></div>
              <div v-if="booking.issuer" class="detail-item"><label>Issued By (ID):</label> <span>{{ booking.issuer }}</span></div>
              <div v-if="booking.receiver" class="detail-item"><label>Received By (ID):</label> <span>{{ booking.receiver }}</span></div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3><i class="fas fa-user-tie"></i> Customer Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Full Name:</label> <span>{{ user.firstName }} {{ user.lastName }}</span></div>
              <div class="detail-item"><label>Email:</label> <span>{{ user.email }}</span></div>
              <div class="detail-item"><label>User UUID:</label> <span>{{ user.uuid }}</span></div>
              <div v-if="user.roles && user.roles.length > 0" class="detail-item"><label>Roles:</label> <span>{{ user.roles.join(', ') }}</span></div>
            </div>
          </div>

          <!-- Car Details -->
          <div class="section">
            <h3><i class="fas fa-car-side"></i> Car Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Make:</label> <span>{{ car.make }}</span></div>
              <div class="detail-item"><label>Model:</label> <span>{{ car.model }}</span></div>
              <div class="detail-item"><label>Year:</label> <span>{{ car.year }}</span></div>
              <div class="detail-item"><label>Price Group:</label> <span>{{ car.priceGroup }}</span></div>
              <div class="detail-item"><label>License Plate:</label> <span>{{ car.licensePlate }}</span></div>
              <div class="detail-item"><label>Car UUID:</label> <span>{{ car.uuid }}</span></div>
              <div class="detail-item"><label>Currently Available:</label> <span>{{ car.available ? 'Yes' : 'No' }}</span></div>
            </div>
          </div>
        </div>

        <!-- === THE ADDITION IS HERE === -->
        <div class="button-container">
          <!-- This button will only show if the booking status is 'CONFIRMED' -->
          <button
              v-if="booking.status === 'CONFIRMED'"
              @click="navigateToCreateRental(booking.uuid)"
              class="button process-button"
          >
            <i class="fas fa-play-circle"></i> Convert to Rental
          </button>
          <button type="button" class="back-button button" @click="goBack">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
        <!-- === END OF ADDITION === -->

      </div>

      <div v-else-if="!isLoading && apiError" class="error-message-container">
        <p class="error-text">{{ failModal.message || "Failed to load booking details." }}</p>
        <button class="button deny-button" @click="goBack">Go Back</button>
      </div>
    </div>
  </div>

  <div class="modal-teleporter">
    <FailureModal
        key="viewBookingFailureModal"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeFailModal"
    />
  </div>
</template>

<script>
import api from "@/api";
import {formatDateTime} from '@/utils/dateUtils.js';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';

export default {
  name: 'AdminViewBooking',
  components: {
    LoadingModal,
    FailureModal,
  },
  data() {
    return {
      booking: null,
      user: null,
      car: null,
      isLoading: true,
      apiError: false,
      failModal: {show: false, message: ""},
    };
  },
  async mounted() {
    await this.fetchBookingDetails();
  },
  methods: {
    formatDateTime,
    formatStatus(status) {
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    /**
     * **NEW**: Returns a dynamic CSS class based on the booking status.
     */
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      return `status-booking-${status.toLowerCase().replace(/_/g, '-')}`;
    },
    async fetchBookingDetails() {
      this.isLoading = true;
      this.apiError = false;
      this.failModal.show = false;
      const bookingUuid = this.$route.params.uuid;

      if (!bookingUuid) {
        this.failModal = { show: true, message: "No booking specified to view." };
        this.isLoading = false;
        this.apiError = true;
        return;
      }

      try {
        const response = await api.get(`/api/v1/admin/bookings/${bookingUuid}`);
        if (response.data?.status === "success" && response.data.data) {
          this.booking = response.data.data;
          this.user = this.booking.user;
          this.car = this.booking.car;

          if (!this.user || !this.car) {
            console.log("Booking data is incomplete and is missing User or Car details.");
          }
        } else {
          this.handleApiResponseError(response.data, "Failed to load booking details.");
          this.apiError = true;
        }
      } catch (error) {
        this.handleApiCatchError(error, "An error occurred while fetching booking details.");
        this.apiError = true;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * **NEW**: Navigates to the "Create Rental from Booking" workflow page.
     * @param {string} bookingUuid - The UUID of the booking to convert.
     */
    navigateToCreateRental(bookingUuid) {
      this.$router.push({ name: 'CreateRental', params: { uuid: bookingUuid } });
    },

    goBack() {
      this.$router.go(-1);
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    handleApiResponseError(responseData, defaultMessage) {
      const errorMsg = responseData?.errors?.map(e => e.message).join('; ') || responseData?.message || defaultMessage;
      this.failModal = { show: true, message: errorMsg };
    },
    handleApiCatchError(error, defaultMessage) {
      const errorMsg = error.response?.data?.errors?.map(e => e.message).join('; ') || error.response?.data?.message || defaultMessage;
      this.failModal = { show: true, message: errorMsg };
    },
  },
};
</script>

<style scoped>
/* Assuming shared styles for .card-container, .form-container, etc. */
.booking-profile {
  max-width: 1200px;
  margin: auto;
}
.form-header {
  text-align: center;
  margin-bottom: 20px;
}
.form-header h1 { font-size: 1.8em; margin-bottom: 5px; }
.form-header h1 i { margin-right: 10px; color: #007bff; }
.sub-header { font-size: 0.9em; color: #6c757d; margin-top: 0; font-family: 'Courier New', Courier, monospace; }

.profile-details { padding-top: 15px; }
.section { margin-bottom: 25px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fdfdff; }
.section h3 { font-size: 1.3em; color: #0056b3; margin-top: 0; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #007bff30; }
.section h3 i { margin-right: 8px; }

.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px 20px; }
.detail-item { font-size: 0.95rem; color: #333; padding: 8px 0; display: flex; align-items: center; }
.detail-item label { font-weight: 600; color: #555; margin-right: 8px; min-width: 140px; }

/* Status Badge Styling */
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.9em; font-weight: bold; color: #fff; }
.status-booking-confirmed { background-color: #28a745; }
.status-booking-rental-initiated, .status-booking-fulfilled { background-color: #007bff; }
.status-booking-user-cancelled, .status-booking-admin-cancelled { background-color: #dc3545; }
/* Add other statuses as needed */
.status-unknown { background-color: #6c757d; }


.error-message-container { text-align: center; padding: 40px; }
.error-text { color: #dc3545; font-weight: bold; }

.button-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e9ecef;
}
.button { padding: 10px 25px; }
.process-button { background-color: #28a745; color: white; }
.process-button:hover { background-color: #218838; }
</style>