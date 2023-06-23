<template>
  <div class="container" >
    <div class="content-container" >
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
          <button v-if="selectedCar" class="rent-button" @click="confirmRental">Confirm Rental</button>
        </div>
     </div>
  </div>

</template>

<script>
import axios from 'axios'; // Import the Axios library

export default {
  name: 'Rental',
  data() {
    return {
      selectedCar: null,
    };
  },
  mounted() {
    this.getSelectedCar();
  },
  methods: {
    async getSelectedCar() {
      try {
        const carId = this.$route.params.carId;
        const response = await axios.get(`http://localhost:8080/api/admin/cars/read/${carId}`);
        this.selectedCar = response.data;
      } catch (error) {
        console.error('Error retrieving car:', error);
      }
    },
    confirmRental() {
      console.log('Confirming rental:', this.selectedCar);
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
</style>
