<template>
  <div class="container">
    <div class="content-container">
      <div class="rental-container">
        <h1>Rent Car</h1>
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
            <p><strong>First Name:</strong> {{ user.firstName }}</p>
            <p><strong>Last Name:</strong> {{ user.lastName }}</p>
            <p><strong>User Name:</strong> {{ user.userName }}</p>
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Phone:</strong> {{ user.phone }}</p>
          </div>
        </div>
        <button v-if="selectedCar" class="rent-button" @click="showConfirmationModal = true">Confirm Rental</button>
      </div>
    </div>
  </div>
  <SuccessModal v-if="successModal.show" @close="closeModal" :show="successModal.show" :message="successModal.message"></SuccessModal>
  <FailureModal v-if="failModal.show" @close="closeModal" :show="failModal.show" :message="failModal.message"></FailureModal>
  <LoadingModal v-if="loading" show />
  <ConfirmationModal
      v-if="showConfirmationModal"
      @confirm="confirmRental"
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

export default {
  name: 'Rental',
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      selectedCar: null,
      user: null,
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
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        await Promise.all([this.getSelectedCar(), this.getUserDetails()]);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error('Error retrieving data:', error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving data';
      }
    },
    async getSelectedCar() {
      try {
        const carId = this.$route.params.carId;
        const response = await axios.get(`http://localhost:8080/api/admin/cars/read/${carId}`);
        this.selectedCar = response.data;
      } catch (error) {
        console.error('Error retrieving car:', error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving car';
      }
    },
    async getUserDetails() {
      try {
        // const userId = this.$store.state.auth.user.id; // Assuming user ID is stored in Vuex state
        // hardcoded userId for now until we get the user id from the store
        const userId = 1;
        const response = await axios.get(`http://localhost:8080/api/admin/users/read/${userId}`);
        this.user = response.data;
      } catch (error) {
        console.error('Error retrieving user:', error);
      }
    },
    async confirmRental() {
      try {
        this.showConfirmationModal = false;
        this.confirmationMessage = `Are you sure you want to confirm this rental? ${this.selectedCar.model} ${this.user.name}`;
        this.loading = true;
        // Perform rental confirmation logic here
        // For example, make an API call to confirm the rental
        // const response = await axios.post('http://localhost:8080/api/rental/confirm', {
        //   carId: this.selectedCar.id,
        //   userId: this.user.id,
        // });

        // Simulating API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Show success message
        this.successModal.show = true;
        this.successModal.message = 'Rental confirmed successfully!';
        this.loading = false;
      } catch (error) {
        console.error('Error confirming rental:', error);
        this.failModal.show = true;
        this.failModal.message = 'Failed to confirm rental';
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
.rental-container {
  margin-top: 20px;
}

.car-details {
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 20px;
  color: black;
}

.user-details {
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 20px;
  color: black;
}
</style>
