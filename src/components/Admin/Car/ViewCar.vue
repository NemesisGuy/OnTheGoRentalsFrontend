<template>
  <div class="card-container card-container-admin ">
    <div class="form-container">
      <div class="car-profile">
        <div class="form-header">
          <h2><i class="fas fa-car"></i> Car Profile: </h2>
          <hr>
        </div>
        <div class="profile-details" v-if="car">
          <div>
            <p><label>ID: </label><span>{{ car.uuid }}</span></p>

            <p><label>Make: </label><span>{{ car.make }}</span></p>

            <p><label>Model: </label><span>{{ car.model }}</span></p>

            <p><label>Year: </label><span>{{ car.year }}</span></p>


            <p><label>Category: </label><span>{{ car.category }}</span></p>

            <p><label>Price Group: </label><span>{{ car.priceGroup }}</span></p>


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
      console.log("Fetching Car profile..." + this.$route.params.uuid);
      const uuid = this.$route.params.uuid// Get the category from the route parameter
      const token = localStorage.getItem('token');
      api
          .get(`/api/v1/admin/cars/${uuid}`)
          .then((response) => {
            this.car = response.data.data;
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


