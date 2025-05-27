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
              <div class="detail-item"><label>Status:</label> <span>{{ formatStatus(booking.status) }}</span></div>
              <div class="detail-item"><label>Collection Date:</label>
                <span>{{ formatDisplayDateTime(booking.bookingStartDate) }}</span></div>
              <div class="detail-item"><label>Expected Return:</label>
                <span>{{ formatDisplayDateTime(booking.bookingEndDate) }}</span></div>
              <div v-if="booking.returnedDate" class.detail-item><label>Actual Return:</label>
                <span>{{ formatDisplayDateTime(booking.returnedDate) }}</span></div>
              <div v-if="booking.fine > 0" class.detail-item><label>Fine:</label> <span>${{
                  booking.fine.toFixed(2)
                }}</span></div>
              <div v-if="booking.issuer" class.detail-item><label>Issued By (ID):</label> <span>{{
                  booking.issuer
                }}</span></div>
              <div v-if="booking.receiver" class.detail-item><label>Received By (ID):</label> <span>{{
                  booking.receiver
                }}</span></div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3><i class="fas fa-user-tie"></i> Customer Details</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Full Name:</label> <span>{{ user.firstName }} {{ user.lastName }}</span>
              </div>
              <div class="detail-item"><label>Email:</label> <span>{{ user.email }}</span></div>
              <div class="detail-item"><label>User UUID:</label> <span>{{ user.uuid }}</span></div>
              <div v-if="user.roles && user.roles.length > 0" class="detail-item"><label>Roles:</label>
                <span>{{ user.roles.join(', ') }}</span></div>
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
              <div class="detail-item"><label>Currently Available:</label> <span>{{
                  car.available ? 'Yes' : 'No'
                }}</span></div>
            </div>
          </div>
        </div>
        <div class="button-container" >
          <button type="button" class="back-button button" @click="goBack">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </div>

      <div v-else-if="!isLoading && apiError" class="error-message-container">
        <p class="error-text">{{ failModal.message || "Failed to load booking details." }}</p>
        <button class="button deny-button" @click="goBack">Go Back</button>
      </div>

    </div>
  </div>

  <!-- Modals are typically placed at the root of the component or app for global stacking context -->
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
  name: 'AdminViewBooking', // More specific name
  components: {
    LoadingModal,
    FailureModal,
  },
  data() {
    return {
      booking: null, // Will hold BookingResponseDTO
      user: null,    // Will hold UserResponseDTO
      car: null,     // Will hold CarResponseDTO
      isLoading: true,
      apiError: false,
      failModal: {show: false, message: ""},
    };
  },
  async mounted() {
    await this.fetchBookingDetails();
  },
  methods: {
    formatDisplayDateTime(dateTimeString) { // Wrapper for template
      return formatDateTime(dateTimeString);
    },
    formatStatus(status) { // Helper for display
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    async fetchBookingDetails() { // Renamed and made primary fetch method
      this.isLoading = true;
      this.apiError = false;
      this.failModal.show = false;

      // Get booking UUID from route parameter
      const bookingUuidFromRoute = this.$route.params.uuid; // <<<< ENSURE YOUR ROUTE PARAM IS 'bookingUuid'
      if (!bookingUuidFromRoute) {
        console.error("AdminViewBooking: No booking UUID provided in route parameters.");
        this.failModal.message = "No booking specified to view.";
        this.failModal.show = true;
        this.isLoading = false;
        this.apiError = true;
        return;
      }

      try {
        console.log(`AdminViewBooking: Fetching booking with UUID: ${bookingUuidFromRoute}`);
        // Fetch the main booking details
        // Endpoint from AdminBookingController: GET /api/v1/admin/bookings/{bookingUuid}
        const bookingResponse = await api.get(`/api/v1/admin/bookings/${bookingUuidFromRoute}`);

        if (bookingResponse.data && bookingResponse.data.status === "success" && bookingResponse.data.data) {
          this.booking = bookingResponse.data.data; // This is BookingResponseDTO
          console.log("AdminViewBooking - Booking data:", this.booking);

          // Now fetch related User and Car details using UUIDs from the booking DTO
          // These are already DTOs within this.booking if your BookingResponseDTO nests them
          if (this.booking.user && this.booking.user.uuid) {
            this.user = this.booking.user; // Already have UserResponseDTO
            console.log("AdminViewBooking - User data (from booking):", this.user);
          } else if (this.booking.user) { // If user object present but no uuid (unlikely for response DTO)
            console.warn("AdminViewBooking - User data in booking DTO is missing UUID.");
            this.user = this.booking.user; // Assign it anyway for other fields
          } else {
            console.error("AdminViewBooking - No user details found in booking response.");
            // You might throw an error or set a specific error message
            this.apiError = true;
            this.failModal.message = "User details missing in booking information.";
            this.failModal.show = true;
          }

          if (this.booking.car && this.booking.car.uuid) {
            this.car = this.booking.car; // Already have CarResponseDTO
            console.log("AdminViewBooking - Car data (from booking):", this.car);
          } else if (this.booking.car) {
            console.warn("AdminViewBooking - Car data in booking DTO is missing UUID.");
            this.car = this.booking.car;
          } else {
            console.error("AdminViewBooking - No car details found in booking response.");
            this.apiError = true;
            this.failModal.message = "Car details missing in booking information.";
            this.failModal.show = true;
          }
          // If Driver is also nested DTO, handle it similarly
          // if (this.booking.driver && this.booking.driver.uuid) this.driver = this.booking.driver;

        } else {
          this.handleApiResponseError(bookingResponse.data, "Failed to load booking details.");
          this.apiError = true;
        }
      } catch (error) {
        this.handleApiCatchError(error, "An error occurred while fetching booking details.");
        this.apiError = true;
      } finally {
        this.isLoading = false;
      }
    },

    // Removed separate fetchUserProfile and fetchCarProfile as BookingResponseDTO should contain nested DTOs

    goBack() {
      this.$router.go(-1); // Or navigate to the admin bookings list
    },
    closeFailModal() {
      this.failModal.show = false;
    },
    handleApiResponseError(responseData, defaultMessage) {
      let errorMsg = defaultMessage;
      if (responseData && responseData.errors && responseData.errors.length > 0) {
        errorMsg = responseData.errors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join('; ');
      } else if (responseData && typeof responseData === 'string' && responseData.length < 200) {
        errorMsg = responseData;
      } else if (responseData && responseData.message) {
        errorMsg = responseData.message;
      }
      console.error("API Response Error (AdminViewBooking):", responseData);
      this.failModal.message = errorMsg;
      this.failModal.show = true; // Ensure modal is shown
    },
    handleApiCatchError(error, defaultMessage) {
      console.error("API Catch Error (AdminViewBooking):", error);
      let errorMessage = defaultMessage;
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          errorMessage = apiResponse.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.message}`).join('; ');
        } else if (typeof apiResponse === 'string' && apiResponse.length < 200) {
          errorMessage = apiResponse;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (error.response.statusText && error.response.statusText !== "") {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server.";
      }
      this.failModal.message = errorMessage;
      this.failModal.show = true; // Ensure modal is shown
    },
  },
};
</script>

<style scoped>
.card-container { /* Styles from UserProfile */
}

.form-container { /* Styles from UserProfile */
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-header h1 {
  font-size: 1.8em;
  margin-bottom: 5px;
}

.form-header h1 i {
  margin-right: 10px;
  color: #007bff;
}

.sub-header {
  font-size: 0.9em;
  color: #6c757d;
  margin-top: 0;
}

.profile-details {
  padding-top: 15px;
}

.section {
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  background-color: var(--bs-gray-100);
}

.section h3 {
  font-size: 1.3em;
  color: #0056b3; /* Darker blue for section titles */
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff30;
}

.section h3 i {
  margin-right: 8px;
}

.section-hr {
  display: none; /* Replaced by h3 border-bottom */
}

.detail-grid { /* Use grid for better alignment */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive columns */
  gap: 10px 20px; /* Row and column gap */
}

.detail-item {
  font-size: 0.95rem;
  color: #333;
  padding: 5px 0;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  margin-right: 8px;
  min-width: 120px; /* Align labels */
  display: inline-block;
}

.detail-item span {
  color: #222;
}

.loading-container, .error-message-container {
  text-align: center;
  padding: 40px;
}

.error-text {
  color: #dc3545;
  font-weight: bold;
}

.modal-teleporter {
  /* For global modal positioning if needed */
}

.button { /* Basic button styling */
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
}

.deny-button {
  background-color: #6c757d;
  color: white;
}

.deny-button:hover {
  background-color: #5a6268;
}

/* Styles for card-container-admin and other shared classes should come from your global styles or UsersManagement.vue style */
</style>