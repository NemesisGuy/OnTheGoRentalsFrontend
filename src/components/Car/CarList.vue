<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of {{ category }} Cars</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortCars('id')">ID</th>
          <th @click="sortCars('make')">Make</th>
          <th @click="sortCars('model')">Model</th>
          <th @click="sortCars('year')">Year</th>
          <th @click="sortCars('category')">Category</th>
          <th @click="sortCars('priceGroup')">Price Group</th>
          <th @click="sortCars('licensePlate')">License Plate</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="car in sortedCars" :key="car.id">
          <td>{{ car.id }}</td>
          <td>{{ car.make }}</td>
          <td>{{ car.model }}</td>
          <td>{{ car.year }}</td>
          <td>{{ car.category }}</td>
          <td>{{ car.priceGroup }}</td>
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
      category: '',
      sortColumn: '', // Current column to sort by
      sortDirection: '', // Current sort direction
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
    },
    sortCars(column) {
      if (this.sortColumn === column) {
        // If the same column is clicked again, toggle the sort direction
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // If a different column is clicked, set the new sort column and direction
        this.sortColumn = column;
        this.sortDirection = 'asc'; // Default to ascending order
      }
    },
  },
  computed: {
    sortedCars() {
      // Perform the sorting based on the sortColumn and sortDirection
      // Return the sorted cars data
      if (this.sortColumn && this.sortDirection) {
        return this.cars.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            // Case-insensitive string comparison
            return this.sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
          } else {
            // Numeric or other data types comparison
            return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
        });
      }
      // If no sorting is applied, return the original cars data
      return this.cars;
    },
  },
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
