<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of {{ category }} Cars</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>Category</th>
              <th>License Plate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="car in cars" :key="car.id">
              <td>{{ car.id }}</td>
              <td>{{ car.make }}</td>
              <td>{{ car.model }}</td>
              <td>{{ car.year }}</td>
              <td>{{ car.category }}</td>
              <td>{{ car.licensePlate }}</td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CarList',
  data() {
    return {
      cars: [],
      category: '' // New data property for category
    };
  },
  mounted() {
    this.fetchCars();
  },
  methods: {
    fetchCars() {
      const category = this.$route.params.category; // Get the category from the route parameter
      axios
          .get(`http://localhost:8080/api/cars/${category}`) // Use the category in the API endpoint
          .then((response) => {
            this.cars = response.data;
            this.category = category; // Set the category for display
          })
          .catch((error) => {
            console.log(error);
          });
    }
  }
};
</script>

<style scoped>
/* Styles for the CarList component */
</style>

<style>
.car {
  border: 1px solid #5e5a5a;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #bd1b1b;
  color: #181818;
}
</style>
