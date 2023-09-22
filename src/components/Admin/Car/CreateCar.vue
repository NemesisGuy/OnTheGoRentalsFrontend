<template>
  <div class="card-container card-container-admin">
    <div class="form-container">

      <form @submit.prevent="addCar">
        <h2 class="form-header">Add Car</h2>
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
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {PriceGroup} from "@/enums/PriceGroup";

export default {
  data() {
    return {
      car: {


        make: 'Mercedes',
        model: 'SLK 200 Kompressor',
        year: 1900,
        category: 'Sedan',
        priceGroup: PriceGroup.LUXURY,
        licensePlate: '000000'
      }, errorMessage: '' // Added error message data property
    };
  },
  methods: {
    addCar() {
      this.errorMessage = ''; // Reset the error message

      axios.post('http://localhost:8080/api/admin/cars/create', this.car)
          .then(response => {
            // Handle success
            console.log('Car added successfully');
            console.log(response.data);
            console.log(response);
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
            } else {
              // Display a generic error message
              this.errorMessage = 'An error occurred while adding the car.';
            }
          });

      // You can access the car object using 'this.car' in this method
      console.log('Adding car:', this.car);

      // Reset the form after adding the car
      this.resetForm();
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
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 5px;
}

</style>
