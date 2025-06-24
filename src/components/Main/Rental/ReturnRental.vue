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
import axios from 'axios';
import ConfirmationModal from '@/components/Main/Modals/ConfirmationModal.vue';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import api from "@/api";

export default {
  name: 'Return',
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      selectedRental: null,
      showConfirmationModal: false, // Flag to show/hide the confirmation modal
      confirmationMessage: '', // Message to show in the confirmation modal
      successModal: {
        show: false,
        message: '',
      }, // Placeholder for the success modal
      failModal: {
        show: false,
        message: '', // Placeholder for the failure modal
      },
      loading: false,
    };
  },
  mounted() {
    this.loadRental();
  },
  methods: {
    async loadRental() {
      try {
        this.loading = true;
        const rentalId = this.$route.params.rentalId;
        const response = await api.get(`/api/rentals/${rentalId}`);
        this.selectedRental = response.data;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error('Error retrieving rental:', error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving rental';
      }
    },
    async confirmReturn() {
      try {
        this.showConfirmationModal = false;
        this.confirmationMessage = `Are you sure you want to confirm the return of this rental?`;
        this.loading = true;
        // Perform return confirmation logic here
        // For example, make an API call to confirm the return
        // const response = await axios.post('http://localhost:8080/api/rentals/confirm-return', {
        //   rentalId: this.selectedRental.id,
        // });

        // Simulating API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Show success message
        this.successModal.show = true;
        this.successModal.message = 'Return confirmed successfully!';
        this.loading = false;
      } catch (error) {
        console.error('Error confirming return:', error);
        this.failModal.show = true;
        this.failModal.message = 'Failed to confirm return';
        this.loading = false;
      }
    },
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
