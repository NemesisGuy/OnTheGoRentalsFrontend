<template>
  <div class="card-container">
    <div class="car-profile">
      <h1>Car Profile</h1>
      <div class="profile-details" v-if="car">
        <div>
          <label>Make:</label>
          <span>{{ car.make }}</span>
        </div>
        <div>
          <label>Model:</label>
          <span>{{ car.model }}</span>
        </div>
        <div>
          <label>Year:</label>
          <span>{{ car.year }}</span>
        </div>
        <div>
          <label>Category:</label>
          <span>{{ car.category }}</span>
        </div>
        <div>
          <label>Price Group:</label>
          <span>{{ car.priceGroup }}</span>
        </div>
        <div>
          <label>License Plate:</label>
          <span>{{ car.licensePlate }}</span>
        </div>
      </div>
      <div v-else>
        <p>Loading car profile...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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

      axios
          .get(`http://localhost:8080/api/admin/cars/read/${carId}`)
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
.card-container {

padding: 50px;
  justify-content: center;
}
.car-profile {
  margin-top: 20px;
}

.car-profile h1 {
  margin-bottom: 10px;
}

.profile-details div {
  margin-bottom: 10px;
}

label {
  font-weight: bold;
}

span {
  margin-left: 10px;
}
</style>


