<template>
  <div class="create-rental">

    <form @submit.prevent="createRental">
      <h2>Create Rental</h2>
      <label for="user">User:</label>
      <select v-model="selectedUser" id="user" name="userId">
        <option v-for="user in users" :key="user.id" :value="user.id">User ID: {{ user.id }} UserName: {{ user.userName }}</option>
      </select>

      <label for="car">Car:</label>
      <select v-model="selectedCar" id="car" name="carId">
        <option v-for="car in cars" :key="car.id" :value="car.id"> Car ID:{{ car.id }} Make: {{car.make}} Model: {{car.model}}</option>
      </select>

      <label for="startDate">Start Date:</label>
      <input v-model="startDate" type="date" id="startDate" name="startDate" required>

      <label for="endDate">End Date:</label>
      <input v-model="endDate" type="date" id="endDate" name="endDate" required>

      <button type="submit">Create Rental</button>
    </form>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      cars: [],
      selectedUser: '',
      selectedCar: '',
      startDate: '',
      endDate: '',
      errorMessage: '',
    };
  },
  mounted() {
    this.fetchUsers();
    this.fetchCars();
  },
  methods: {
    fetchUsers() {
      axios
          .get('http://localhost:8080/api/admin/users/list/all')
          .then(response => {
            this.users = response.data;
          })
          .catch(error => {
            console.log(error);
          });
    },
    fetchCars() {
      axios
          .get('http://localhost:8080/api/admin/cars/all')
          .then(response => {
            this.cars = response.data;
          })
          .catch(error => {
            console.log(error);
          });
    },
    createRental() {
      this.errorMessage = '';

      const rental = {
        userId: this.selectedUser,
        carId: this.selectedCar,
        startDate: this.startDate,
        endDate: this.endDate,
      };

      axios
          .post('http://localhost:8080/api/admin/rentals/create', rental)
          .then(response => {
            console.log('Rental created successfully');
            console.log(response.data);

            this.resetForm();
          })
          .catch(error => {
            console.log(error);
            if (error.response && error.response.status === 400) {
              this.errorMessage = 'Invalid data. Please check the entered values.';
              console.log(error.response.data);
            } else {
              this.errorMessage = 'An error occurred while creating the rental.';
            }
          });
    },
    resetForm() {
      this.selectedUser = '';
      this.selectedCar = '';
      this.startDate = '';
      this.endDate = '';
    },
  },
};
</script>

<style scoped>
.create-rental {
  margin-top: 20px;
}

h2 {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="date"] {
  width: 200px;
}

button {
  margin-top: 10px;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
