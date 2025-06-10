<template>
  <div class="container">
    <div class="content-container">
      <div class="return-container">
        <h1>Return Car</h1>
        <div v-if="selectedRental" class="rental-details">
          <p><strong>ID:</strong> {{ selectedRental.id }}</p>
          <p><strong>Car:</strong> {{ selectedRental.car }}</p>
          <p><strong>User:</strong> {{ selectedRental.user }}</p>
          <p><strong>Rental Date:</strong> {{ selectedRental.rentalDate }}</p>
          <p><strong>Return Date:</strong> {{ selectedRental.returnDate }}</p>
          <p><strong>Total Amount:</strong> {{ selectedRental.totalAmount }}</p>
        </div>
        <button v-if="selectedRental" class="return-button" @click="showConfirmationModal = true">Confirm Return
        </button>
      </div>
    </div>
  </div>
  <SuccessModal v-if="successModal.show" @close="closeModal" :show="successModal.show"
                :message="successModal.message"></SuccessModal>
  <FailureModal v-if="failModal.show" @close="closeModal" :show="failModal.show"
                :message="failModal.message"></FailureModal>
  <LoadingModal v-if="loading" show/>
  <ConfirmationModal
      v-if="showConfirmationModal"
      @confirm="confirmReturn"
      @cancel="closeModal"
      :show="showConfirmationModal"
  >
    <p>{{ confirmationMessage }}</p>
  </ConfirmationModal>
</template>

<script>
// import axios from 'axios'; // Unused if actual API call uses the 'api' instance
import ConfirmationModal from '@/components/Main/Modals/ConfirmationModal.vue';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import api from "@/api"; // Available for use

/**
 * @file ReturnRental.vue
 * @description This component handles the process of returning a rented car.
 * It fetches details of a specific rental based on a route parameter and allows
 * a user (presumably staff) to confirm the return of the vehicle.
 * @component ReturnRental
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'ReturnRental', // Changed from 'Return' for better descriptiveness
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} selectedRental - Stores the details of the rental being processed.
   * @property {boolean} showConfirmationModal - Controls visibility of the return confirmation modal.
   * @property {string} confirmationMessage - Message for the confirmation modal (Note: currently set but not directly used in the modal's slot in the template).
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
      selectedRental: null,
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
   * Initiates loading of the rental details.
   */
  mounted() {
    this.loadRental();
  },
  methods: {
    /**
     * Fetches details of the rental to be returned from the API,
     * using the `rentalId` from the current route parameters.
     * Updates `selectedRental` and handles loading/error states.
     * @async
     * @returns {void}
     */
    async loadRental() {
      try {
        this.loading = true;
        const rentalId = this.$route.params.rentalId;
        if (!rentalId) {
          console.error('ReturnRental: No rentalId found in route parameters.');
          this.failModal.show = true;
          this.failModal.message = 'Rental ID is missing. Cannot load rental details.';
          this.loading = false;
          return;
        }
        // Assuming API returns rental details directly in response.data or response.data.data
        const response = await api.get(`/api/rentals/${rentalId}`);
        this.selectedRental = response.data.data || response.data;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error('Error retrieving rental:', error.response || error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving rental details. Please try again.';
      }
    },
    /**
     * Confirms the return of the rental.
     * Currently, this method simulates an API call using `setTimeout`.
     * A commented-out actual API call exists, which uses `axios.post` with a hardcoded URL.
     * For production, this should be replaced with a proper API call using the configured `api` instance.
     * Shows success or failure modal based on the (simulated) outcome.
     * @async
     * @returns {void}
     * @warning The actual API call for confirming return is commented out and uses a hardcoded URL.
     *          This needs to be implemented correctly using the `api` instance.
     */
    async confirmReturn() {
      try {
        this.showConfirmationModal = false;
        // The confirmationMessage is set here but the modal template uses a static message + slot.
        // This line primarily serves to update data if it were used elsewhere.
        this.confirmationMessage = `Are you sure you want to confirm the return of this rental?`;
        this.loading = true;

        // Actual API call is commented out:
        // const response = await axios.post('http://localhost:8080/api/rentals/confirm-return', {
        //   rentalId: this.selectedRental.id,
        // });
        // TODO: Replace simulation with actual API call using `api` instance, e.g.:
        // const response = await api.post(`/api/rentals/confirm-return/${this.selectedRental.id}`);
        // or similar, depending on backend requirements.

        // Simulating API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Assuming simulation is successful:
        this.successModal.show = true;
        this.successModal.message = 'Return confirmed successfully!';
        this.loading = false;
      } catch (error) {
        console.error('Error confirming return:', error.response || error);
        this.failModal.show = true;
        this.failModal.message = 'Failed to confirm return. Please try again.';
        this.loading = false;
      }
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
  },
};
</script>

<style scoped>

</style>
