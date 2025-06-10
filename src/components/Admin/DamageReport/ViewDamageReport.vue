<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="report-profile">
        <div class="form-header">
          <h2><i class="fas fa-exclamation-triangle"></i> Damage Report Details</h2>
        </div>
        <hr/>

        <LoadingModal v-if="loading" :show="true" message="Loading report details..."/>

        <div v-else-if="apiError" class="error-message">
          <p>{{ apiErrorMessage || "Failed to load damage report details. Please try again." }}</p>
        </div>

        <div v-else-if="damageReport" class="profile-details">
          <!-- Report Details -->
          <div class="section">
            <h3><i class="fas fa-file-alt"></i> Report Details:</h3> <!-- Changed icon -->
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Report UUID:</label> <span>{{ damageReport.uuid }}</span></div>
              <div class="detail-item"><label>Description:</label> <span style="white-space: pre-wrap;">{{ damageReport.description }}</span></div>
              <div class="detail-item"><label>Date & Time:</label> <span>{{ formatDisplayDateTime(damageReport.dateAndTime) }}</span></div>
              <div class="detail-item"><label>Location:</label> <span>{{ damageReport.location }}</span></div>
              <div class="detail-item"><label>Repair Cost:</label> <span>{{ damageReport.repairCost != null ? '$' + damageReport.repairCost.toFixed(2) : 'N/A' }}</span></div>
            </div>
          </div>

          <!-- Rental Details -->
          <div v-if="rental" class="section">
            <h3><i class="fas fa-calendar-check"></i> Associated Rental Details:</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Rental UUID:</label> <span>{{ rental.uuid }}</span></div>
              <div class="detail-item"><label>Rental Start Date:</label> <span>{{ formatDisplayDateTime(rental.bookingStartDate || rental.issuedDate) }}</span></div>
              <div class="detail-item"><label>Rental End Date:</label> <span>{{ formatDisplayDateTime(rental.bookingEndDate || rental.expectedReturnedDate) }}</span></div>
              <div v-if="rental.returnedDate" class="detail-item"><label>Actual Return:</label> <span>{{ formatDisplayDateTime(rental.returnedDate) }}</span></div>
              <div v-if="rental.fine > 0" class="detail-item"><label>Rental Fine:</label> <span>${{ rental.fine.toFixed(2) }}</span></div>
              <div v-if="rental.status" class="detail-item"><label>Rental Status:</label> <span>{{ rental.status }}</span></div>
            </div>
          </div>
          <div v-else class="section"><p>Rental details could not be loaded.</p></div>

          <!-- User Details -->
          <div v-if="user" class="section">
            <h3><i class="fas fa-user"></i> Customer Details:</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>User UUID:</label> <span>{{ user.uuid }}</span></div>
              <div class="detail-item"><label>Name:</label> <span>{{ user.firstName }} {{ user.lastName }}</span></div>
              <div class="detail-item"><label>Email:</label> <span>{{ user.email }}</span></div>
              <div v-if="user.roles && user.roles.length > 0" class="detail-item"><label>Roles:</label> <span>{{ user.roles.join(', ') }}</span></div>
            </div>
          </div>
          <div v-else class.section><p>User details could not be loaded.</p></div>

          <!-- Car Details -->
          <div v-if="car" class="section">
            <h3><i class="fas fa-car"></i> Car Details:</h3>
            <hr class="section-hr"/>
            <div class="detail-grid">
              <div class="detail-item"><label>Car UUID:</label> <span>{{ car.uuid }}</span></div>
              <div class="detail-item"><label>Make:</label> <span>{{ car.make }}</span></div>
              <div class="detail-item"><label>Model:</label> <span>{{ car.model }}</span></div>
              <div class="detail-item"><label>Year:</label> <span>{{ car.year }}</span></div>
              <div class="detail-item"><label>Category:</label> <span>{{ car.category }}</span></div>
              <div class="detail-item"><label>License Plate:</label> <span>{{ car.licensePlate }}</span></div>
              <div class="detail-item"><label>Available:</label> <span>{{ car.available ? 'Yes' : 'No' }}</span></div>
            </div>
          </div>
          <div v-else class.section><p>Car details could not be loaded.</p></div>
          <hr/>
        </div>

        <div v-else-if="!loading && !apiError" class="error-message"> <!-- Catch all for no damageReport -->
            <p>Damage report not found or could not be loaded.</p>
        </div>
      </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack" :disabled="loading"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from "axios"; // Removed
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils"; // Import global formatter
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // For explicit loading state

// Local Axios interceptor removed.

/**
 * @file ViewDamageReport.vue
 * @description Admin component for displaying the detailed information of a specific damage report,
 * including related rental, user, and car details.
 * It fetches these details through potentially multiple API calls.
 * @component ViewDamageReport
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "ViewDamageReport", // Changed name
  components: {
    LoadingModal, // Using this for overall loading state
    // FailureModal could be added if specific error display is needed beyond apiErrorMessage
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} damageReport - Stores the main damage report object.
   * @property {object|null} rental - Stores the associated rental details.
   * @property {object|null} user - Stores the associated user details.
   * @property {object|null} car - Stores the associated car details.
   * @property {boolean} loading - Flag to indicate if primary data is currently being fetched.
   * @property {boolean} apiError - Flag to indicate if an API error occurred during data fetching.
   * @property {string} apiErrorMessage - Stores a user-friendly error message.
   */
  data() {
    return {
      damageReport: null,
      rental: null,
      user: null,
      car: null,
      loading: true, // Initialize to true as data is fetched on mount
      apiError: false,
      apiErrorMessage: "",
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Initiates fetching of the damage report and its related details.
   */
  mounted() {
    this.fetchFullDamageReportDetails(); // Renamed for clarity
  },
  methods: {
    /**
     * Exposes the global `formatDateTime` utility to the template.
     * @param {string} dateTimeString - The ISO date-time string.
     * @returns {string} Formatted date-time string.
     */
    formatDisplayDateTime(dateTimeString) { // Changed name to avoid conflict if global was also named formatDateTime
      return formatDateTime(dateTimeString);
    },
    /**
     * Fetches the main damage report and subsequently its related rental, user, and car details.
     * (Note: This uses a waterfall approach with multiple API calls. A backend endpoint returning
     * a comprehensive DTO with all nested details would be more efficient.)
     * Manages loading and error states.
     * @async
     * @returns {void}
     */
    async fetchFullDamageReportDetails() { // Renamed method
      this.loading = true;
      this.apiError = false;
      this.apiErrorMessage = "";
      const reportId = this.$route.params.uuid;

      if (!reportId) {
        console.error("ViewDamageReport: No report UUID provided in route parameters.");
        this.apiErrorMessage = "Damage Report ID is missing from the URL.";
        this.apiError = true;
        this.loading = false;
        return;
      }

      try {
        console.log(`ViewDamageReport: Fetching damage report with UUID: ${reportId}`);
        const reportResponse = await api.get(`/api/v1/admin/damage-reports/${reportId}`);

        if (reportResponse.data?.status === "success" && reportResponse.data?.data) {
          this.damageReport = reportResponse.data.data;
          console.log("ViewDamageReport - Main damage report data:", this.damageReport);

          // If damage report contains nested DTOs for rental, user, car, use them directly.
          // Otherwise, fetch them if only UUIDs are present.
          if (this.damageReport.rental?.uuid) {
            await this.fetchRentalDetails(this.damageReport.rental.uuid);
            if (this.rental?.user?.uuid) {
              await this.fetchUserDetails(this.rental.user.uuid);
            } else if (this.damageReport.rental?.user) {
                this.user = this.damageReport.rental.user;
            }
            if (this.rental?.car?.uuid) {
              await this.fetchCarDetails(this.rental.car.uuid);
            } else if (this.damageReport.rental?.car) {
                this.car = this.damageReport.rental.car;
            }
          } else if (this.damageReport.rental) {
            this.rental = this.damageReport.rental;
            if (this.rental.user) this.user = this.rental.user;
            if (this.rental.car) this.car = this.rental.car;
          }
           else {
            console.warn("ViewDamageReport: Rental information/UUID missing in damage report response.");
          }
        } else {
          this.apiErrorMessage = reportResponse.data?.message || reportResponse.data?.errors?.map(e=>e.message).join(', ') || "Failed to load damage report details.";
          this.apiError = true;
        }
      } catch (error) {
        console.error("Error fetching damage report details:", error.response || error.message || error);
        this.apiErrorMessage = error.response?.data?.message || error.message || "An error occurred while fetching details.";
        this.apiError = true;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Fetches details for a specific rental.
     * @param {string} rentalUuid - The UUID of the rental to fetch.
     * @async
     */
    async fetchRentalDetails(rentalUuid) {
      try {
        const response = await api.get(`/api/v1/admin/rentals/${rentalUuid}`);
        if (response.data?.status === "success" && response.data?.data) {
          this.rental = response.data.data;
          console.log("ViewDamageReport - Rental data:", this.rental);
        } else {
           console.warn("ViewDamageReport: Rental details not found or error for UUID:", rentalUuid, response.data);
        }
      } catch (error) {
        console.error(`Error fetching rental details for UUID ${rentalUuid}:`, error.response || error);
      }
    },
    /**
     * Fetches details for a specific user.
     * @param {string} userUuid - The UUID of the user to fetch.
     * @async
     */
    async fetchUserDetails(userUuid) {
      try {
        const response = await api.get(`/api/v1/admin/users/${userUuid}`);
         if (response.data?.status === "success" && response.data?.data) {
          this.user = response.data.data;
          console.log("ViewDamageReport - User data:", this.user);
        } else {
           console.warn("ViewDamageReport: User details not found or error for UUID:", userUuid, response.data);
        }
      } catch (error) {
        console.error(`Error fetching user details for UUID ${userUuid}:`, error.response || error);
      }
    },
    /**
     * Fetches details for a specific car.
     * @param {string} carUuid - The UUID of the car to fetch.
     * @async
     */
    async fetchCarDetails(carUuid) {
      try {
        const response = await api.get(`/api/v1/admin/cars/${carUuid}`);
        if (response.data?.status === "success" && response.data?.data) {
          this.car = response.data.data;
          console.log("ViewDamageReport - Car data:", this.car);
        } else {
           console.warn("ViewDamageReport: Car details not found or error for UUID:", carUuid, response.data);
        }
      } catch (error) {
        console.error(`Error fetching car details for UUID ${carUuid}:`, error.response || error);
      }
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
    // Removed unused showSuccessModal, showFailureModal, closeModal as FailureModal is directly controlled by data props
  },
};
</script>

<style scoped> /* Changed to scoped */
/* Basic styling for demonstration */
.profile-details div {
  margin-bottom: 10px;
  display: flex; /* For aligning label and span */
  align-items: flex-start; /* Align items at the start for multi-line content */
}
.profile-details label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 150px; /* Adjust as needed for alignment */
  flex-shrink: 0; /* Prevent label from shrinking */
}
.profile-details span {
  flex-grow: 1; /* Allow span to take remaining space */
  word-break: break-word; /* Break long words/emails */
}
.error-message p {
  color: red;
  text-align: center;
}
/* Add other styles from ViewCar.vue or common admin styles if applicable */
</style>
