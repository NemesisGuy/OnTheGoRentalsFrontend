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
        <button v-if="selectedCar" class="rent-button" @click="confirmRental">Confirm Rental</button>
      </div>

  </div>
  </div>

</template>

<script>
import axios from 'axios';

export default {
  name: 'Rental',
  data() {
    return {
      selectedCar: null,
      user: null,
    };
  },
  mounted() {
    this.getSelectedCar();
    this.getUserDetails();
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
    async getUserDetails() {
      try {
       // const userId = this.$store.state.auth.user.id; // Assuming user ID is stored in Vuex state
        //hardcoded userId for now until we get the user id from the store
        const userId = 1;


        const response = await axios.get(`http://localhost:8080/api/admin/users/read/${userId}`);
        this.user = response.data;
      } catch (error) {
        console.error('Error retrieving user:', error);
      }
    },
    confirmRental() {
      console.log('Confirming rental:', this.selectedCar, this.user);
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
.user-details{
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 20px;
  color: black;
}
</style>
