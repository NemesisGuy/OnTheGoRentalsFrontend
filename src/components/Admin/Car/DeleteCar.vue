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
          <th>Delete</th>
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
          <td><button @click="deleteCar(car.id)">Delete</button></td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// Add this line to set a default base URL for your API
axios.defaults.baseURL = 'http://localhost:8080';

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
  name: 'DeleteCar',
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
      const category = 'all';
      const token = localStorage.getItem('token');
      axios
          .get(`/api/cars/${category}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.cars = response.data;
            this.category = category;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    sortCars(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    deleteCar(carId) {
      const token = localStorage.getItem('token');
      axios
          .delete(`api/admin/cars/delete/${carId}`
              , {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
          .then((response) => {
            this.fetchCars();
            console.log(response);
            console.log('Car deleted');
          })
          .catch((error) => {
            console.log(error);
            console.log('Car not deleted');
          });
    },
  },
  computed: {
    sortedCars() {
      if (this.sortColumn && this.sortDirection) {
        return this.cars.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
          } else {
            return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
        });
      }
      return this.cars;
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
