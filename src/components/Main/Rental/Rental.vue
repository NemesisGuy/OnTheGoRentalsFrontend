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
            <p><strong>User Name:</strong> {{ user.userName }}</p>
            <p><strong>First Name:</strong> {{ user.firstName }}</p>
            <p><strong>Last Name:</strong> {{ user.lastName }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Phone:</strong> {{ user.phoneNumber }}</p>
          </div>
        </div>
        <div class="button-container">
          <button class="read-button button" @click="goToCarList"><i class="fas fa-arrow-left"></i> Back</button>
          <button v-if="selectedCar" class="accept-button button" @click="showConfirmationModal = true">Confirm Rental
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
    getPricePerDay(priceGroup) {
      const rentalPrices = {
        ECONOMY: 50,
        STANDARD: 80,
        LUXURY: 150,
        PREMIUM: 200,
        EXOTIC: 300,
        SPECIAL: 250,
        OTHER: 100,
        NONE: 0,
      };
      return rentalPrices[priceGroup];
    },
    async getSelectedCar() {
      try {
        const carId = this.$route.params.carId;
          const token = localStorage.getItem('token');
          console.log("token", localStorage.getItem('token'))
        const response = await axios.get(`http://localhost:8080/api/cars/read/${carId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        this.selectedCar = response.data;
      } catch (error) {
        console.error('Error retrieving car:', error);
        this.failModal.show = true;
        this.failModal.message = 'Error retrieving car';
          console.log("token", localStorage.getItem('token'))
      }
    },
    async getUserDetails() {
      try {
        //const userId = 1; // Replace with the actual user ID from Vuex or other source
          const token = localStorage.getItem('token');
          console.log("token", localStorage.getItem('token'))
        const response = await axios.get("http://localhost:8080/api/user/profile/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        this.user = response.data;
      } catch (error) {
        console.error('Error retrieving user:', error);
          console.log("token", localStorage.getItem('token'))
      }
    },
    confirmRental() {
      this.showConfirmationModal = false;
      this.confirmationMessage = `Are you sure you want to confirm this rental? ${this.selectedCar.model} ${this.user.name}`;
      this.loading = true;
        console.log("token", localStorage.getItem('token'))

      const rentalData = {
        car: this.selectedCar,
        user: this.user,
        issuer: this.user.id,
        receiver: null,
        fine: 0,
        finePayed: 0,
        issuedDate: new Date(),
        returnedDate: null,
      };
        const token = localStorage.getItem('token');
        console.log("token", localStorage.getItem('token'))

      axios.post('http://localhost:8080/api/rentals/create', rentalData, {
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          }
      })
          .then(response => {
            if (response.status === 200) {
              console.log(response);
              this.loading = false;
              this.successModal.show = true;
              this.successModal.message = 'Rental confirmed successfully!';
            } else {
              console.log(response);
              this.loading = false;
              this.failModal.show = true;
              this.failModal.message = 'Failed to confirm rental';
            }
          })
          .catch(error => {
            console.log(error);
            this.loading = false;
            this.failModal.show = true;
            this.failModal.message = error.response.data || 'An error occurred while confirming the rental.';
          });
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

