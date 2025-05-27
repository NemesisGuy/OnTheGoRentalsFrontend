<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form @submit.prevent="addCar">
        <div class="form-header">
          <h2><i class="fas fa-car"></i> Add Car</h2>
        </div>
        <div class="form-group">
          <label for="make">Make:</label>
          <input id="make" v-model="car.make" required type="text">
        </div>
        <div class="form-group">
          <label for="model">Model:</label>
          <input id="model" v-model="car.model" required type="text">
        </div>
        <div class="form-group">
          <label for="year">Year:</label>
          <input id="year" v-model="car.year" required type="number">
        </div>
        <div class="form-group">
          <label for="category">Category:</label>
          <input id="category" v-model="car.category" required type="text">
        </div>
        <div class="form-group">
          <label for="priceGroup">Price Group:</label>

          <select id="priceGroup" v-model="car.priceGroup" required>
            <option value="ECONOMY">Economy</option>
            <option value="STANDARD">Standard</option>
            <option value="LUXURY">Luxury</option>
            <option value="PREMIUM">Premium</option>
            <option value="EXOTIC">Exotic</option>
            <option value="SPECIAL">Special</option>
            <option value="OTHER">Other</option>
            <option value="NONE">None</option>
          </select>

        </div>
        <div class="form-group">
          <label for="licensePlate">License Plate:</label>
          <input id="licensePlate" v-model="car.licensePlate" required type="text">
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
          <button class="back-button button" type="button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </form>
    </div>
    <!-- Add the SuccessModal component -->
    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeModal"
        @close="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
    ></SuccessModal>
    <!-- Add the FailureModal component -->
    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    ></FailureModal>
  </div>

</template>

<script>
import axios from "axios";
import {PriceGroup} from "@/enums/PriceGroup";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";


// Add an interceptor for every request
axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
);
export default {
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      car: {
        make: 'Mercedes',
        model: 'SLK 200 Kompressor',
        year: 1900,
        category: 'Sedan',
        priceGroup: PriceGroup.LUXURY,
        licensePlate: '000000'
      },
      errorMessage: '',// Added error message data property
      successModal: {
        show: false,
        message: ""
      },
      failModal: {
        show: false,
        message: ""
      },
      loadingModal: {
        show: false,
      },

    };
  },
  methods: {
    addCar() {
      this.loadingModal.show = true;

      this.errorMessage = ''; // Reset the error message
      const token = localStorage.getItem('token');

      api.post('/api/v1/admin/cars', this.car
          )
          .then(response => {
            // Handle success

            console.log('Car added successfully ');
            console.log(response.data);
            console.log(response);
            this.loadingModal.show = false;
            this.successModal.message = 'Car added successfully';
            this.successModal.show = true;

          })
          .catch(error => {
            // Handle error
            console.log(error);
            if (error.response && error.response.status === 400) {
              // Display an error message to the user
              this.errorMessage = 'Invalid data. Please check the entered values.';
              console.log(error.response.data); // The response data contains details about the validation errors or data issues
              console.log(error.response.status);
              console.log(error.response);
              this.failModal.message = 'Invalid data. Please check the entered values.';
              this.failModal.show = true;
            } else {
              // Display a generic error message
              this.errorMessage = 'An error occurred while adding the car.';
              this.failModal.message = 'An error occurred while adding the car.';
              this.failModal.show = true;
            }
          });

      // You can access the car object using 'this.car' in this method
      console.log('Adding car:', this.car);

      // Reset the form after adding the car
      this.resetForm();
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },

    resetForm() {
      // Reset the form fields
      this.car = {
        id: '',
        make: '',
        model: '',
        year: 0,
        category: '',
        priceGroup: '',
        licensePlate: ''
      };
    },goBack() {
    this.$router.go(-1); // Go back to the previous page
  }
  },
};
</script>

<style scoped>

</style>
