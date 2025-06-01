<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin"> <!-- Using admin-specific form container style -->
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show" :message="loadingModal.message"/>

      <form ref="rentalForm" @submit.prevent="triggerConfirmation">
        <div class="form-header">
          <h2><i class="fas fa-file-signature"></i> Create Rental from Booking</h2>
          <p v-if="bookingDetails.uuid">
            Converting Booking: {{ bookingDetails.uuid ? bookingDetails.uuid.substring(0,8) : 'N/A' }}...
          </p>
        </div>

        <!-- User (pre-populated, display only or selectable if admin can change) -->
        <div class="form-group">
          <label for="userDisplay">Customer:</label>
          <input id="userDisplay" :value="selectedUserName" type="text" disabled title="User is from the booking and cannot be changed here.">
          <!-- Hidden input for form submission if needed, or just use selectedUserUuid -->
          <input v-model="rental.userUuid" type="hidden">
        </div>

        <!-- Car (pre-populated, display only or selectable if admin can change) -->
        <div class="form-group">
          <label for="carDisplay">Car:</label>
          <input id="carDisplay" :value="selectedCarName" type="text" disabled title="Car is from the booking. Change via re-booking if needed.">
          <input v-model="rental.carUuid" type="hidden">
        </div>

        <!-- Driver (optional, can be selected by staff) -->
        <div class="form-group">
          <label for="driver">Assign Driver (Optional):</label>
          <select id="driver" v-model="rental.driverUuid" name="driverUuid">
            <option :value="null">-- No Driver --</option>
            <option v-for="driver in availableDrivers" :key="driver.uuid" :value="driver.uuid">
              {{ driver.firstName }} {{ driver.lastName }} (Lic: {{driver.licenseNumber || 'N/A'}})
            </option>
          </select>
        </div>

        <!-- Issuer (Staff Member - defaults to current admin/staff) -->
        <div class="form-group">
          <label for="issuer">Issuing Staff Member:</label>
          <select id="issuer" v-model="rental.issuerId" name="issuerId" required>
            <option :value="null" disabled>-- Select Issuing Staff --</option>
            <!-- Assuming currentStaff is an option, or a list of staff is fetched -->
            <option v-if="currentStaffUser" :value="currentStaffUser.uuid">
              Me: {{ currentStaffUser.firstName }} {{ currentStaffUser.lastName }}
            </option>
            <option v-for="staff in staffList" :key="staff.uuid" :value="staff.uuid">
              {{ staff.firstName }} {{ staff.lastName }}
            </option>
          </select>
        </div>

        <!-- Issued Date (Defaults to now, staff can adjust slightly if needed) -->
        <div class="form-group">
          <label for="issuedDate">Issued Date & Time (Pickup):</label>
          <input id="issuedDate" v-model="rental.issuedDate" name="issuedDate" type="datetime-local" required>
        </div>

        <!-- Expected Return Date (pre-populated from booking) -->
        <div class="form-group">
          <label for="expectedReturnDate">Expected Return Date & Time:</label>
          <input id="expectedReturnDate" v-model="rental.expectedReturnDate" name="expectedReturnDate" type="datetime-local" required>
        </div>

        <!-- Initial Fine (Usually 0 at creation) -->
        <div class="form-group">
          <label for="fine">Initial Fine (if any):</label>
          <input id="fine" v-model.number="rental.fineAmount" name="fineAmount" type="number" step="0.01" min="0">
        </div>

        <!-- Status (Defaults to ACTIVE for a new rental being created now) -->
        <div class="form-group">
          <label for="status">Rental Status:</label>
          <input id="status" :value="formatStatus(rental.status)" type="text" disabled title="Status will be ACTIVE upon creation.">
        </div>


        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="isSubmitting">
            <i class="fas fa-check"></i> {{ isSubmitting ? 'Creating...' : 'Create Rental' }}
          </button>
          <button type="button" class="back-button button" @click="goBack" :disabled="isSubmitting">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
        key="rentalCreationConfirmationModal"
        :show="showConfirmationModal"
        title="Confirm Rental Creation"
        @cancel="cancelCreation"
        @confirm="executeCreateRental"
    >
      <template #default>
        <div>
          <p>Please confirm the details for the new rental:</p>
          <hr>
          <p><strong>Customer:</strong> {{ selectedUserName }}</p>
          <p><strong>Car:</strong> {{ selectedCarName }}</p>
          <p v-if="selectedDriverName"><strong>Driver:</strong> {{ selectedDriverName }}</p>
          <p><strong>Issuing Staff:</strong> {{ selectedIssuerName }}</p>
          <p><strong>Issued Date:</strong> {{ formatDisplayDateTime(rental.issuedDate) }}</p>
          <p><strong>Expected Return:</strong> {{ formatDisplayDateTime(rental.expectedReturnDate) }}</p>
          <p v-if="rental.fineAmount > 0"><strong>Initial Fine:</strong> ${{ rental.fineAmount.toFixed(2) }}</p>
          <p><strong>Status:</strong> {{ formatStatus(rental.status) }}</p>
          <hr>
          <p>Proceed with creating this rental?</p>
        </div>
      </template>
    </ConfirmationModal>

    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndGoBack" @ok="closeModalAndGoBack"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeModal"/>
  </div>
</template>

<script>
import api from "@/api";
import { formatDateTime, formatInputDateTime } from '@/utils/dateUtils'; // Assuming formatInputDateTime exists
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

// Define your RentalStatus enum values as used in the backend (for default setting)
const RENTAL_STATUS_ACTIVE = 'ACTIVE';
const log = console;
export default {
  name: "AdminCreateRentalFromBooking",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  props: {
    bookingUuid: { // Passed as a route param when navigating here
      type: String,
      required: false, // Make it optional if this form can also create rentals from scratch
    }
  },
  data() {
    return {
      bookingDetails: {}, // To store fetched booking details
      rental: { // Corresponds to RentalRequestDTO (admin version)
        userUuid: null,
        uuid: null,
        driverUuid: null,
        issuerId: null, // Logged-in staff user ID
        receiverId: null, // Typically null at creation
        fineAmount: 0.0,
        issuedDate: formatInputDateTime(new Date()), // Default to now
        expectedReturnDate: '',
        status: RENTAL_STATUS_ACTIVE, // Default for a new rental being created
      },
      users: [], // For issuer/receiver dropdown if not defaulting to current user
      cars: [],  // Potentially for car selection if not pre-filled (less likely for this flow)
      availableDrivers: [],
      currentStaffUser: null, // Store logged-in staff user details
      staffList: [], // For issuer/receiver dropdown

      loadingModal: { show: false, message: "Loading..." },
      isSubmitting: false,
      errorMessage: '',
      showConfirmationModal: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" }
    };
  },
  computed: {
    selectedUserName() {
      if (this.bookingDetails.user) {
        return `${this.bookingDetails.user.firstName} ${this.bookingDetails.user.lastName} (UUID: ${this.bookingDetails.user.uuid ? this.bookingDetails.user.uuid.substring(0,8) : 'N/A'}...)`;
      }
      return 'N/A';
    },
    selectedCarName() {
      if (this.bookingDetails.car) {
        return `${this.bookingDetails.car.make} ${this.bookingDetails.car.model} (UUID: ${this.bookingDetails.car.uuid ? this.bookingDetails.car.uuid.substring(0,8) : 'N/A'}...)`;
      }
      return 'N/A';
    },
    selectedDriverName() {
      const driver = this.availableDrivers.find(d => d.uuid === this.rental.driverUuid);
      return driver ? `${driver.firstName} ${driver.lastName}` : null;
    },
    selectedIssuerName() {
      const staff = this.staffList.find(s => s.id === this.rental.issuerId);
      if (staff) return `${staff.firstName} ${staff.lastName}`;
      if (this.currentStaffUser && this.currentStaffUser.uuid === this.rental.issuerId) {
        return `Me: ${this.currentStaffUser.firstName} ${this.currentStaffUser.lastName}`;
      }
      return 'N/A';
    }
  },
  async created() { // Use created for initial data fetching
    await this.fetchInitialData();
  },
  methods: {
    formatDisplayDateTime(dateTimeString) {
      return formatDateTime(dateTimeString); // From your utils
    },
    formatStatus(status) { // For display in confirmation
      if (!status) return 'N/A';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    async fetchInitialData() {
      this.loadingModal.show = true;
      this.loadingModal.message = "Loading initial data...";
      try {
        // Fetch current logged-in staff user (assuming you have an endpoint for this)
        // This user's ID will be the default issuerId
         const staffProfileResponse = await api.get('/api/v1/users/me/profile');
        this.currentStaffUser = staffProfileResponse.data.data;
        if (this.currentStaffUser) {
          this.rental.issuerId = this.currentStaffUser.uuid;
        }
        // For now, let's assume issuerId is selected or comes from booking if available
        // You might need to fetch a list of staff users for the issuer/receiver dropdowns

        // Fetch available drivers
        const driversResponse = await api.get('/api/v1/admin/drivers'); // Assuming admin endpoint for all drivers
        if (driversResponse.data && driversResponse.data.status === 'success') {
          this.availableDrivers = driversResponse.data.data;
        }

        if (this.bookingUuid) {
          this.loadingModal.message = "Fetching booking details...";
          const bookingResponse = await api.get(`/api/v1/admin/bookings/${this.bookingUuid}`); // Admin endpoint to fetch any booking
          if (bookingResponse.data && bookingResponse.data.status === 'success') {
            this.bookingDetails = bookingResponse.data.data;
            this.prepopulateFormFromBooking();
          } else {
            throw new Error("Booking details not found or invalid response.");
          }
        } else {
          // This form is being used to create a rental from scratch, not from a booking
          // May need to fetch lists of users and available cars for dropdowns
          // this.fetchUsersList();
          // this.fetchAvailableCarsList();
          this.rental.issuedDate = formatInputDateTime(new Date()); // Default for scratch creation
          log.info("Creating rental from scratch (no booking pre-population).");
        }
      } catch (error) {
        log.error("Error fetching initial data:", error.response?.data || error.message);
        this.failModal.message = "Failed to load initial data: " + (error.response?.data?.errors?.[0]?.message || error.message);
        this.failModal.show = true;
      } finally {
        this.loadingModal.show = false;
      }
    },
    prepopulateFormFromBooking() {
      if (this.bookingDetails && this.bookingDetails.uuid) {
        this.rental.userUuid = this.bookingDetails.user?.uuid;
        this.rental.carUuid = this.bookingDetails.car?.uuid;
        this.rental.driverUuid = this.bookingDetails.driver?.uuid || null; // Pre-populate if driver was on booking
        this.rental.issuedDate = formatInputDateTime(new Date()); // Pickup is happening now
        this.rental.expectedReturnDate = this.bookingDetails.bookingEndDate ? formatInputDateTime(this.bookingDetails.bookingEndDate) : '';
        this.rental.status = RENTAL_STATUS_ACTIVE; // New rental from booking is ACTIVE
        // Issuer might be the currently logged-in staff, to be set. Fine is 0. Receiver is null.
        log.info("Form pre-populated from Booking UUID:", this.bookingUuid);
      }
    },
    triggerConfirmation() {
      // Basic form validation before showing confirmation
      if (!this.rental.userUuid || !this.rental.carUuid || !this.rental.issuedDate || !this.rental.expectedReturnDate || this.rental.issuerId == null) {
        this.errorMessage = "Please fill in all required fields (Customer, Car, Issuer, Issued Date, Expected Return Date).";
        this.failModal.message = this.errorMessage;
        this.failModal.show = true;
        return;
      }
      this.errorMessage = '';
      this.showConfirmationModal = true;
    },
    cancelCreation() {
      this.showConfirmationModal = false;
      log.debug("Rental creation cancelled by user at confirmation step.");
    },
    async executeCreateRental() {
      this.showConfirmationModal = false;
      this.isSubmitting = true;
      this.loadingModal.show = true;
      this.loadingModal.message = "Creating rental...";
      this.errorMessage = '';

      // Prepare payload matching RentalRequestDTO (admin version)
      const payload = {
        userUuid: this.rental.userUuid,
        carUuid: this.rental.carUuid,
        driverUuid: this.rental.driverUuid || null, // Ensure null if empty
        issuerId: this.rental.issuerId,
        // receiverId: this.rental.receiverId, // Usually null at creation
        fineAmount: this.rental.fineAmount || 0.0,
        issuedDate: this.rental.issuedDate,
        expectedReturnDate: this.rental.expectedReturnDate,
        status: this.rental.status, // Should be 'ACTIVE'
      };
      log.debug("Rental creation payload:", payload);

      try {
        // Endpoint for admin creating a rental (or converting booking)
        // OPTION A: If backend handles booking-to-rental conversion:
        // await api.post(`/api/v1/admin/rentals/from-booking/${this.bookingUuid}`, payloadForConversion);
        // OPTION B: If this is creating a new rental directly (booking already processed):
        const response = await api.post('/api/v1/admin/rentals', payload);

        log.info('Rental created successfully response:', response.data);
        this.successModal.message = `Rental created successfully! UUID: ${response.data.data.uuid ? response.data.data.uuid.substring(0,8) : 'N/A'}...`;
        this.successModal.show = true;
        // Don't resetForm here, let closeModalAndGoBack handle it
      } catch (error) {
        console.error('Error creating rental:', error.response?.data || error.message);
        const apiErrors = error.response?.data?.errors;
        this.errorMessage = apiErrors ? apiErrors.map(e => e.message || e.field).join(', ') : (error.response?.data?.message || "An error occurred.");
        this.failModal.message = this.errorMessage;
        this.failModal.show = true;
      } finally {
        this.isSubmitting = false;
        this.loadingModal.show = false;
      }
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    closeModalAndGoBack() {
      this.closeModal();
      this.$router.push({ name: 'StaffDailyOps' }); // Or wherever staff should go after creating a rental
    },
    resetForm() { // Simplified, as pre-population will handle defaults if coming from booking
      this.rental = {
        userUuid: null, uuid: null, driverUuid: null, issuerId: this.currentStaffUser ? this.currentStaffUser.id : null,
        receiverId: null, fineAmount: 0.0, issuedDate: formatInputDateTime(new Date()),
        expectedReturnDate: '', status: RENTAL_STATUS_ACTIVE,
      };
      this.bookingDetails = {}; // Clear pre-populated booking
      if (this.$refs.rentalForm) {
        this.$refs.rentalForm.reset(); // Reset native form state if needed
      }
      log.debug("Rental form reset.");
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
/* Assuming form-container-admin and other common styles are global */
.form-group input[disabled], .form-group select[disabled] {
  background-color: #e9ecef;
  opacity: 0.7;
  cursor: not-allowed;
  color:  var(--bs-black);
}
.error-message {
  color: var(--error-color, red); /* From your global styles */
  margin-top: 10px;
  margin-bottom: 15px;
  font-weight: bold;
}
.button-container {
  justify-content: space-between; /* Spreads out confirm and back buttons */
}
</style>