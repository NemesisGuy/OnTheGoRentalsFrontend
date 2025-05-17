<template>
  <div class="card-container card-container-admin ">
    <div class="form-container">
      <div class="car-profile">
        <h1><i class="fas fa-car"></i> Car Profile: </h1>
        <div class="profile-details" v-if="car">
          <div>
            <p><label>Make:</label><span>{{ car.make }}</span></p>

            <p><label>Model:</label><span>{{ car.model }}</span></p>

            <p><label>Year:</label><span>{{ car.year }}</span></p>


            <p><label>Category:</label><span>{{ car.category }}</span></p>

            <p><label>Price Group:</label><span>{{ car.priceGroup }}</span></p>


            <p><label>License Plate: </label>{{ car.licensePlate }}</p>
            <p><label>Available: </label>{{ car.available }}</p>


          </div>
        </div>
        <div v-else>
          <p>Loading car profile...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";
// Add this line to set a default base URL for your API


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
  name: 'ViewCar',
  data() {
    return {
      car: null,
    };
  },
  mounted() {
    this.fetchCarProfile();
  },
  methods: {
    fetchCarProfile() {
      // Assuming you have the car ID or any other identifier to fetch the car's profile
      const carId = this.$route.params.id// Get the category from the route parameter
      const token = localStorage.getItem('token');
      api
          .get(`/api/admin/cars/read/${carId}`)
          .then((response) => {
            this.car = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
  },
};
</script>

<style scoped>

</style>


