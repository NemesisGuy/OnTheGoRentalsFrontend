<template>
  <div class="container">
    <div class="content-container">
      <div class="rental-container">
        <h1>Book Car</h1>
        <div v-if="selectedCar" class="car-details">
          <p><strong>ID:</strong> {{ selectedCar.id }}</p>
          <p><strong>Make:</strong> {{ selectedCar.make }}</p>
          <p><strong>Model:</strong> {{ selectedCar.model }}</p>
          <p><strong>Year:</strong> {{ selectedCar.year }}</p>
          <p><strong>Category:</strong> {{ selectedCar.category }}</p>
          <p><strong>Price Group:</strong> {{ selectedCar.priceGroup }}</p>
          <p><strong>License Plate:</strong> {{ selectedCar.licensePlate }}</p>
        </div>
        <div class="user-container">
          <h2>User Details</h2>
          <div v-if="user" class="user-details">
            <p><strong>ID:</strong> {{ user.id }}</p>
            <!--            <p><strong>User Name:</strong> {{ user.userName }}</p>-->
            <p><strong>First Name:</strong> {{ user.firstName }}</p>
            <p><strong>Last Name:</strong> {{ user.lastName }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <!--            <p><strong>Phone:</strong> {{ user.phoneNumber }}</p>-->
          </div>
        </div>
        <div class="button-container">
          <button class="read-button button" @click="goToCarList"><i class="fas fa-arrow-left"></i> Back</button>
          <button v-if="selectedCar" class="accept-button button" @click="showConfirmationModal = true">Confirm Booking
          </button>
        </div>
      </div>
    </div>
  </div>
  <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show"
                @close="closeModal"></SuccessModal>
  <FailureModal
      v-if="failModal.show"
      key="failModal"
      :message="failModal.message || errorMessage"
      :show="failModal.show"
      @cancel="closeModal"
      @close="closeModal"
  ></FailureModal>

  <LoadingModal v-if="loading" show/>
  <ConfirmationModal
      v-if="showConfirmationModal"
      :show="showConfirmationModal"
      @cancel="closeModal"
      @confirm="confirmRental"
  >
    <p>{{ confirmationMessage }}</p>
    <p>Are you sure you want to confirm this rental?</p>
    <p>User: {{ user.userName }} {{ user.email }}</p>
    <p>Car: {{ selectedCar.make }} {{ selectedCar.model }}</p>
    <p>Price: R {{ getPricePerDay(selectedCar.priceGroup) }} per day</p>
  </ConfirmationModal>
</template>

<script>
// import axios from 'axios'; // Unused, api instance is generally used
import ConfirmationModal from '@/components/Main/Modals/ConfirmationModal.vue';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import api from "@/api";

/**
 * @file Rental.vue
 * @description This component handles the display of car and user details for a rental booking
 * and allows the user to confirm the rental. It fetches car details based on a route parameter
 * and the current user's profile.
 * @component Rental
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'Rental',
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} selectedCar - Stores the details of the car selected for rental.
   * @property {object} user - Stores the details of the currently logged-in user.
   * @property {string} user.id - User's ID.
   * @property {string} user.firstName - User's first name.
   * @property {string} user.lastName - User's last name.
   * @property {string} user.email - User's email.
   * @property {Array<object>} user.roles - User's roles.
   * @property {boolean} showConfirmationModal - Controls visibility of the rental confirmation modal.
   * @property {string} confirmationMessage - Message to display in the confirmation modal (Note: seems set but not directly used in template for modal message).
   * @property {object} successModal - Controls the success modal.
   * @property {boolean} successModal.show - Visibility of success modal.
   * @property {string} successModal.message - Message for success modal.
   * @property {object} failModal - Controls the failure modal.
   * @property {boolean} failModal.show - Visibility of failure modal.
   * @property {string} failModal.message - Message for failure modal.
   * @property {boolean} loading - Flag to indicate if data is being loaded or an operation is in progress.
   */
  data() {
    return {
      selectedCar: null,
      user: {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        roles: [{roleName: "USER"}],
      },
      showConfirmationModal: false,
      confirmationMessage: '',
      successModal: {
        show: false,
        message: '',
      },
      failModal: {
        show: false,
        message: '',
      },
      loading: false,
    };
  },
  /**
   * Lifecycle hook called after the component has been mounted to the DOM.
   * Initiates loading of car and user data.
   */
  mounted() {
    this.loadData();
  },
  methods: {
    /**
     * Asynchronously loads initial data: selected car details (based on route param) and current user details.
     * Sets loading state and handles errors by showing a failure modal.
     * @async
     * @returns {void}
     */
    async loadData() {
      try {
        this.loading = true;
        await Promise.all([this.getSelectedCar(), this.getUserDetails()]);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error('Error retrieving data:', error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving initial rental data. Please try again.';
      }
    },
    /**
     * Retrieves the price per day for a car based on its price group.
     * Uses a hardcoded mapping of price groups to daily rates.
     * @param {string} priceGroup - The price group of the car (e.g., 'ECONOMY', 'LUXURY').
     * @returns {number} The price per day, or 0 if the price group is not found or is 'NONE'.
     */
    getPricePerDay(priceGroup) {
      const rentalPrices = {
        ECONOMY: 50, STANDARD: 80, LUXURY: 150, PREMIUM: 200,
        EXOTIC: 300, SPECIAL: 250, OTHER: 100, NONE: 0,
      };
      // Ensure priceGroup is in uppercase for case-insensitive matching
      return rentalPrices[String(priceGroup).toUpperCase()] || 0;
    },
    /**
     * Fetches details of the selected car from the API using the `carId` from route parameters.
     * Updates the `selectedCar` data property. Shows failure modal on error.
     * @async
     * @returns {void}
     */
    async getSelectedCar() {
      try {
        const carId = this.$route.params.carId;
        if (!carId) {
          console.error('No carId found in route parameters.');
          this.failModal.show = true;
          this.failModal.message = 'Car ID is missing. Cannot load car details.';
          return;
        }
        const response = await api.get(`/api/cars/read/${carId}`);
        // Assuming API returns car in response.data for success, or response.data.data
        // Based on other components, response.data.data is common for successful GETs
        this.selectedCar = response.data.data || response.data;
      } catch (error) {
        console.error('Error retrieving car:', error.response || error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving car details. Please try again.';
      }
    },
    /**
     * Fetches details of the currently authenticated user from the API.
     * Updates the `user` data property. Shows failure modal on error.
     * @async
     * @returns {void}
     */
    async getUserDetails() {
      try {
        const response = await api.get(`/api/user/profile/read/profile`);
        // Assuming API returns user in response.data.data for success
        const userData = response.data.data || response.data;
        this.user.id = userData.id;
        this.user.firstName = userData.firstName;
        this.user.lastName = userData.lastName;
        this.user.email = userData.email;
        this.user.roles = userData.roles;
      } catch (error) {
        console.error('Error retrieving user details:', error.response || error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving your user details. Please ensure you are logged in.';
      }
    },
    /**
     * Confirms the rental and submits the booking data to the backend.
     * Constructs rental data payload and POSTs it. Handles success and failure responses.
     * @async
     * @returns {void}
     * @warning The API endpoint for creating a booking is currently hardcoded to 'http://localhost:8080'.
     *          This should be changed to use the configured `api` instance for portability.
     */
    confirmRental() {
      this.showConfirmationModal = false;
      this.loading = true;

      const rentalData = {
        carUuid: this.selectedCar ? this.selectedCar.uuid : null,
        userUuid: this.user ? this.user.id : null,
        issuer: this.user.id,
        receiver: null,
        fine: 0,
        finePayed: 0, // Note: finePayed vs finePaid (typo?)
        issuedDate: new Date().toISOString(),
        returnedDate: null,
      };

      // TODO: Replace hardcoded URL with `api.post('/api/user/booking/create', rentalData)`
      // For now, documenting the existing hardcoded URL.
      api.post('http://localhost:8080/api/user/booking/create', rentalData)
          .then(response => {
            this.loading = false;
            if (response.status === 200 || response.status === 201) {
              console.log('Rental confirmed response:', response);
              this.successModal.show = true;
              this.successModal.message = 'Rental confirmed successfully!';
            } else {
              console.warn('Rental confirmation may have failed. Response:', response);
              this.failModal.show = true;
              this.failModal.message = response.data?.message || 'Failed to confirm rental. Unexpected server response.';
            }
          })
          .catch(error => {
            console.error('Error confirming rental:', error.response || error);
            this.loading = false;
            this.failModal.show = true;
            this.failModal.message = error.response?.data?.message || error.response?.data || 'An error occurred while confirming the rental.';
          });
    },
    /**
     * Closes any active modals (confirmation, success, failure).
     * @returns {void}
     */
    closeModal() {
      this.showConfirmationModal = false;
      this.successModal.show = false;
      this.failModal.show = false;
    },
    /**
     * Navigates to the car list page.
     * @returns {void}
     */
    goToCarList() {
        this.$router.push({ name: 'CarList', params: { pricegroup: 'all'} });
    }
  },
};
</script>

<style scoped>

</style>
