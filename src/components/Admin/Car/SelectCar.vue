<template>
  <div class="car-selection-container">
    <div class="card car-list-card">
      <h2>Car List</h2>
      <input type="text" v-model="searchQuery" placeholder="Search Car" />
      <ul>
        <li v-for="car in filteredCars" :key="car.id" @click="selectCar(car.id)" :class="{ active: selectedCarId === car.id }">
          {{ car.make }} {{ car.model }} ({{ car.year }})
        </li>
      </ul>
    </div>

    <div class="card car-details-card">
      <h2>Car Details</h2>
      <div v-if="selectedCar">
        <div>
          <label>Make:</label>
          <span>{{ selectedCar.make }}</span>
        </div>
        <div>
          <label>Model:</label>
          <span>{{ selectedCar.model }}</span>
        </div>
        <div>
          <label>Year:</label>
          <span>{{ selectedCar.year }}</span>
        </div>
        <div>
          <label>Category:</label>
          <span>{{ selectedCar.category }}</span>
        </div>
        <div>
          <label>Price Group:</label>
          <span>{{ selectedCar.priceGroup }}</span>
        </div>
        <div>
          <label>License Plate:</label>
          <span>{{ selectedCar.licensePlate }}</span>
        </div>
      </div>
      <div v-else>
        <p>No car selected.</p>
      </div>
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
  name: 'CarSelection',
  data() {
    return {
      cars: [],
      selectedCarId: '',
      selectedCar: null,
      searchQuery: '',
    };
  },
  mounted() {
    this.fetchCars();
  },
  methods: {
    fetchCars() {
      const token = localStorage.getItem('token');
      axios
          .get('/api/admin/cars/all'
              , {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
          .then((response) => {
            this.cars = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    selectCar(carId) {
      this.selectedCarId = carId;
      this.selectedCar = this.cars.find((car) => car.id === this.selectedCarId);
    },
  },
  computed: {
    filteredCars() {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return this.cars.filter((car) => {
          const makeModel = `${car.make} ${car.model}`.toLowerCase();
          return makeModel.includes(query);
        });
      }
      return this.cars;
    },
  },
};
</script>

<style scoped>
.car-selection-container {
  display: flex;
  justify-content: space-between;
}

.card {
  padding: 20px;
  border-radius: 2px;
  background-color: #6610f2;
  width: 45%;
  box-shadow: black 0px 0px 5px 0px;
}

.car-list-card {
  margin: 20px;
}

.car-list-card h2 {
  margin-bottom: 10px;
}

.car-list-card input[type="text"] {
  margin-bottom: 10px;
}

.car-list-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.car-list-card li {
  cursor: pointer;
  padding: 5px;
  margin-bottom: 5px;
}

.car-list-card li:hover,
.car-list-card li.active {
  background-color: #6610f2;
}

.car-details-card {
  margin: 20px;
  background-color: #6610f2;
}

.car-details-card h2 {
  margin-bottom: 10px;
}

label {
  font-weight: bold;
}

span {
  margin-left: 10px;
}
</style>
