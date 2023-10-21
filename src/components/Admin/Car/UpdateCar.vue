<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Update  Cars</h1>
      <h2>List of {{ category }} Cars</h2>
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
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="car in sortedCars" :key="car.id">
          <td>{{ car.id }}</td>
          <td>
            <input v-model="car.make" :disabled="!car.editMode" />
          </td>
          <td>
            <input v-model="car.model" :disabled="!car.editMode" />
          </td>
          <td>
            <input v-model="car.year" :disabled="!car.editMode" />
          </td>
          <td>
            <input v-model="car.category" :disabled="!car.editMode" />
          </td>
          <td>
            <select v-model="car.priceGroup" :disabled="!car.editMode" required>
              <option value="ECONOMY">ECONOMY</option>
              <option value="STANDARD">STANDARD</option>
              <option value="LUXURY">LUXURY</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="EXOTIC">EXOTIC</option>
              <option value="SPECIAL">SPECIAL</option>
              <option value="OTHER">OTHER</option>
              <option value="NONE">NONE</option>
            </select>
          </td>

          <td>
            <input v-model="car.licensePlate" :disabled="!car.editMode" />
          </td>
          <td>
            <button @click="toggleEditMode(car)">
              {{ car.editMode ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <button @click="deleteCar(car.id)">Delete</button>
          </td>
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
  name: 'EditCar',
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
            this.cars = response.data.map((car) => ({
              ...car,
              editMode: false,
            }));
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
          .delete(`/api/admin/cars/delete/${carId}`, {
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
    toggleEditMode(car) {
      if (car.editMode) {
        this.updateCar(car);
      }
      car.editMode = !car.editMode;
    },
    updateCar(car) {
      const token = localStorage.getItem('token');
      axios
          .put(`/api/admin/cars/update/${car.id}`, car, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            console.log(response);
            console.log('Car updated');
          })
          .catch((error) => {
            console.log(error);
            console.log('Car not updated');
          });
    },
  },
  computed: {
    sortedCars() {
      let sortedCars = [...this.cars];

      if (this.sortColumn) {
        sortedCars.sort((a, b) => {
          let valueA = a[this.sortColumn];
          let valueB = b[this.sortColumn];

          if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }

          if (valueA < valueB) {
            return this.sortDirection === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return this.sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      return sortedCars;
    },
  },
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
