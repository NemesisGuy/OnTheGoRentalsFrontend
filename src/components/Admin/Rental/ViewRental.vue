<template>
  <div class="card-container">
    <div class="form-container">
        <div class="rental-profile">
          <h1>Rental Profile</h1>
          <hr>
          <div class="profile-details" v-if="rental && user && car">
            <div class="section">
              <h3>Rental Details:</h3>
              <hr>
              <div class="detail-row">
                <div>
                  <label>Rental ID:</label>
                  <span>{{ rental.rentalId }}</span>
                </div>
                <div>
                  <label>Rental Date:</label>
                  <span>{{ rental.issuedDate }}</span>
                </div>
                <div>
                  <label>Return Date:</label>
                  <span>{{ rental.returnedDate }}</span>
                </div>
                <div>
                  <label>Fine:</label>
                  <span>{{ rental.fine }}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h3>Customer Details:</h3>
              <hr>
              <div class="detail-row">
                <div>
                  <label>Customer Name:</label>
                  <span>{{ user.userName }}</span>
                </div>
                <div>
                  <label>Customer First Name:</label>
                  <span>{{ user.firstName }}</span>
                </div>
                <div>
                  <label>Customer Last Name:</label>
                  <span>{{ user.lastName }}</span>
                </div>
                <div>
                  <label>Customer Email:</label>
                  <span>{{ user.email }}</span>
                </div>
                <div>
                  <label>Customer Phone Number:</label>
                  <span>{{ user.phoneNumber }}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h3>Car Details:</h3>
              <hr>
              <div class="detail-row">
                <div>
                  <label>Car Make:</label>
                  <span>{{ car.make }}</span>
                </div>
                <div>
                  <label>Car Model:</label>
                  <span>{{ car.model }}</span>
                </div>
                <div>
                  <label>Car Year:</label>
                  <span>{{ car.year }}</span>
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
            </div>
          </div>
          <div v-else>
            <p>Loading rental profile...</p>
          </div>
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
  name: 'ViewRental',
  data() {
    return {
      rental: null,
      user: null,
      car: null,
    };
  },
  mounted() {
    this.fetchRentalProfile();

  },
  methods: {
    fetchRentalProfile() {
      const rentalId = this.$route.params.id;
      const token = localStorage.getItem('token');
      axios
          .get(`/api/admin/rentals/read/${rentalId}`
              , {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
          .then((response) => {
            this.rental = response.data;
            this.fetchUserProfile();
            this.fetchCarProfile();
          })
          .catch((error) => {
            console.log(error);
          });
    },
    fetchUserProfile() {
      const userId = this.rental.user.id;
      const token = localStorage.getItem('token');
      axios
          .get(`/api/admin/users/read/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.user = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    fetchCarProfile() {
      const carId = this.rental.car.id;
      const token = localStorage.getItem('token');
      axios
          .get(`/api/admin/cars/read/${carId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
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
