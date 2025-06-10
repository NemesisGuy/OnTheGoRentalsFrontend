<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <router-view></router-view>

      <form ref="bookingForm" @submit.prevent="handleSubmit">
        <div class="form-header">
          <h2><i class="fas fa-calendar-check"></i> Create Booking</h2>
        </div>

        <div class="form-group">
          <label for="user">User:</label>
          <select id="user" v-model="selectedUserUuid" name="userUuid" required>
            <option disabled value="">Please select a user</option>
            <option v-for="user in users" :key="user.uuid" :value="user.uuid">
              Email: {{ user.email }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="issuedDate">Collection Date:</label>
          <input id="issuedDate" v-model="selectedIssuedDate" name="issuedDate" required type="datetime-local">
        </div>

        <div class="form-group">
          <label for="returnedDate">Return Date:</label>
          <input id="returnedDate" v-model="selectedReturnedDate" name="returnedDate" required type="datetime-local">
        </div>

        <div class="form-group">
          <label for="car">Car:</label>
          <select id="car" v-model="selectedCarUuid" name="carUuid" required>
            <option disabled value="">Please select a car</option>
            <option v-for="car in cars" :key="car.uuid" :value="car.uuid">
              Make: {{ car.make }}, Model: {{ car.model }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <div class="button-container">
            <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
            <button type="button" class="back-button button" @click="goBack">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body">
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelBooking"
        @confirm="confirmBooking"
    >
      <template v-if="showConfirmationModal">
        <div>
          <h3>Confirmation</h3>
          <p>Are you sure you want to create this Booking?</p>
          <hr>
          <p>User UUID: {{ selectedUserUuid }}</p>
          <p>Issued Date: {{ selectedIssuedDate }}</p>
          <p>Returned Date: {{ selectedReturnedDate }}</p>
          <p>Car UUID: {{ selectedCarUuid }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>

    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    ></SuccessModal>

    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    ></FailureModal>
  </div>
</template>

<script>
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import api from "@/api";

/**
 * @file CreateBooking.vue
 * @description Admin component for creating new bookings.
 * It allows administrators to select a user, a car, and specify booking start and end dates.
 * Includes data fetching for users and cars, form validation, and a confirmation step.
 * (Note: The template contains a <router-view>, which might be unexpected for a creation form page.)
 * @component AdminCreateBooking
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminCreateBooking', // Explicit name
  components: {
    ConfirmationModal,
    SuccessModal,
    FailureModal,
    LoadingModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} users - List of users fetched for the user selection dropdown.
   * @property {Array<object>} cars - List of cars fetched for the car selection dropdown.
   * @property {string} selectedUserUuid - UUID of the user selected for the booking.
   * @property {string} selectedCarUuid - UUID of the car selected for the booking.
   * @property {string} selectedIssuedDate - ISO8601 date-time string for the booking start date (collection date).
   * @property {string} selectedReturnedDate - ISO8601 date-time string for the booking end date (return date).
   * @property {boolean} loadingModal - Controls visibility of the loading modal.
   * @property {string} errorMessage - Stores form-level validation or error messages.
   * @property {boolean} showConfirmationModal - Controls visibility of the booking confirmation modal.
   * @property {object} successModal - Controls the success modal state.
   * @property {object} failModal - Controls the failure modal state.
   */
  data() {
    return {
      users: [],
      cars: [],
      selectedUserUuid: "",
      selectedCarUuid: "",
      selectedIssuedDate: "", // Corresponds to bookingStartDate in payload
      selectedReturnedDate: "", // Corresponds to bookingEndDate in payload
      loadingModal: false,
      errorMessage: "",
      showConfirmationModal: false,
      successModal: {
        show: false,
        message: "",
      },
      failModal: {
        show: false,
        message: "",
      },
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches initial lists of users and cars.
   */
  mounted() {
    this.fetchUsersList();
    this.fetchCarsList();
  },
  methods: {
    /**
     * Fetches the list of users from the admin API endpoint.
     * Populates the `users` data property. Manages loading state and shows failure modal on error.
     * @async
     * @returns {void}
     */
    fetchUsersList() {
      this.loadingModal = true;
      api.get("/api/v1/admin/users") // Removed manual Authorization header
          .then((response) => {
            // Assuming response.data.data contains the array of users
            this.users = response.data?.data || [];
            if (!response.data?.data) console.warn("CreateBooking (Admin): User list not found in expected response structure", response.data);
          })
          .catch((error) => {
            console.error("Error fetching users:", error.response || error);
            this.failModal.message = "Failed to fetch user list. Please ensure you are authorized.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },

    /**
     * Fetches the list of cars from the admin API endpoint.
     * Populates the `cars` data property. Manages loading state and shows failure modal on error.
     * @async
     * @returns {void}
     */
    fetchCarsList() {
      this.loadingModal = true;
      api.get("/api/v1/admin/cars") // Removed manual Authorization header
          .then((response) => {
            // Assuming response.data.data contains the array of cars
            this.cars = response.data?.data || [];
            if (!response.data?.data) console.warn("CreateBooking (Admin): Car list not found in expected response structure", response.data);
          })
          .catch((error) => {
            console.error("Error fetching cars:", error.response || error);
            this.failModal.message = "Failed to fetch car list. Please ensure you are authorized.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },

    /**
     * Handles the initial submission of the booking form.
     * Performs basic validation and, if valid, shows the confirmation modal.
     * @returns {void}
     */
    handleSubmit() {
      this.errorMessage = ""; // Reset error message
      if (!this.selectedUserUuid || !this.selectedCarUuid || !this.selectedIssuedDate || !this.selectedReturnedDate) {
        this.errorMessage = "Please fill in all required fields.";
        this.failModal.message = "All fields are required to create a booking."; // Show in modal too
        this.failModal.show = true;
        return;
      }
      // Add more specific date validation if needed (e.g., end date after start date)
      this.showConfirmationModal = true;
    },

    /**
     * Confirms and creates the booking after user approval from the confirmation modal.
     * Sends a POST request to the backend API with the booking details.
     * Shows success or failure modals based on the API response. Resets form on success.
     * @async
     * @returns {void}
     * @note Assumes the API response on successful creation (`response.data`) directly contains
     *       properties like `userEmail`, `carMake`, `model`, `issuedDate`, `returnDate` for the success message.
     *       If the actual created booking object is nested (e.g., in `response.data.data`), this needs adjustment.
     */
    confirmBooking() {
      this.loadingModal = true;
      this.showConfirmationModal = false;

      const bookingPayload = {
        userUuid: this.selectedUserUuid,
        carUuid: this.selectedCarUuid,
        bookingStartDate: this.selectedIssuedDate, // Maps to bookingStartDate
        bookingEndDate: this.selectedReturnedDate,   // Maps to bookingEndDate
      };

      api.post("/api/v1/admin/bookings", bookingPayload) // Removed manual Authorization header
          .then((response) => {
            // It's safer to assume the created object is in response.data.data if that's the general API pattern
            const bookingData = response.data?.data || response.data;

            if (response.data?.status === "success" && bookingData) {
              // Construct message carefully based on guaranteed fields in bookingData
              let carInfo = "Selected Car";
              if (bookingData.car) { // If car object is nested in bookingData
                 carInfo = `${bookingData.car.make || ''} ${bookingData.car.model || ''}`;
              } else if (bookingData.carMake && bookingData.model) { // If fields are flat
                 carInfo = `${bookingData.carMake} ${bookingData.model}`;
              }
              this.successModal.message = `Booking created successfully for ${carInfo}.`;
              this.successModal.show = true;
              this.resetForm();
            } else {
              this.failModal.message = response.data?.message || response.data?.errors?.map(e=>e.message).join(', ') || "Failed to create booking: Unexpected server response.";
              this.failModal.show = true;
            }
          })
          .catch((error) => {
            this.failModal.message = error.response?.data?.message || error.response?.data?.errors?.map(e=>e.message).join(', ') || "An error occurred while creating the booking.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },

    /**
     * Cancels the booking creation process from the confirmation modal.
     * Hides the confirmation modal and clears any form error messages.
     * @returns {void}
     */
    cancelBooking() {
      this.showConfirmationModal = false;
      this.errorMessage = ""; // Clear form error message
    },

    /**
     * Closes any active success, failure, or confirmation modals and clears form error messages.
     * @returns {void}
     */
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false; // Ensure confirmation modal is also closed
      this.errorMessage = "";
    },

    /**
     * Resets all form fields to their initial empty states.
     * @returns {void}
     */
    resetForm() {
      this.selectedUserUuid = "";
      this.selectedCarUuid = "";
      this.selectedIssuedDate = "";
      this.selectedReturnedDate = "";
      this.errorMessage = ""; // Also clear any displayed error message
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

</style>