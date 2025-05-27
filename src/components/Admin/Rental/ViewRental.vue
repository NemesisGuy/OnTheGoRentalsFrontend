<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="rental-profile">
        <div class="form-header">
          <h2><i class="fas fa-car"></i> Rental Profile</h2 >
        </div>

        <hr>
        <div v-if="!loading" class="profile-details">
          <div class="section">
            <h3>Rental Details:</h3>
            <hr>
            <div class="detail-row">
              <div>
                <label>ID:</label>
                <span>{{ rental.uuid }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div>
                <label>Start Date:</label>
                <span>{{ formatDateTime(rental.issuedDate) }}</span>
              </div>
              <div>
                <label>Return Date:</label>
                <span>{{ formatDateTime(rental.returnedDate) }}</span>
              </div>
              <div>
                <label>Fine:</label>
                <span>{{ rental.fine }}</span>
              </div>
            </div>
          </div>
          <hr>
          <div class="section">
            <h3>Customer Details:</h3>
            <hr>
            <div class="detail-row">
              <div>
                <label>Name:</label>
                <span>{{ user.firstName }}, {{ user.lastName }} </span>
              </div>
              <div>
                <label>First Name:</label>
                <span>{{ user.firstName }}</span>
              </div>
              <div>
                <label>Last Name:</label>
                <span>{{ user.lastName }}</span>
              </div>
              <div>
                <label>Email:</label>
                <span>{{ user.email }}</span>
              </div>
<!--              <div>
                <label>Customer Phone Number:</label>
                <span>{{ user.phoneNumber }}</span>
              </div>-->
            </div>
          </div>
          <hr>
          <div class="section">
            <h3>Car Details:</h3>
            <hr>
            <div class="detail-row">
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
                <label>Price Group:</label>
                <span>{{ car.priceGroup }}</span>
              </div>
              <div>
                <label>License Plate:</label>
                <span>{{ car.licensePlate }}</span>
              </div>
            </div>
          </div>
          <hr>
        </div>
        <div v-else>
          <ShimmerCard/>
          <LoadingModal show="show"/>
          <p>Loading rental profile...</p>
        </div>
      </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>

  </div>
</template>


<script>
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

import {formatDateTime} from '@/utils/dateUtils.js'
import ShimmerCard from "@/components/Main/Loaders/ShimmerCard.vue";

// Add this line to set a default base URL for your API
// axios.defaults.baseURL = 'http://localhost:8080';


export default {
  name: 'ViewRental',
  components: {ShimmerCard, LoadingModal},
  data() {
    return {
      rental: null,
      user: null,
      car: null,
      loading: true,
    };
  },
  mounted() {
    this.fetchRentalProfile();

  },
  methods: {
    formatDateTime,

    fetchRentalProfile() {
      this.loading = true;
      const rentalId = this.$route.params.uuid;
      const token = localStorage.getItem('token');
      api
          .get(`/api/v1/admin/rentals/${rentalId}`
          )
          .then((response) => {
            this.rental = response.data.data;
            this.fetchUserProfile();
            this.fetchCarProfile();
            this.loading = false;
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
          });
    },
    fetchUserProfile() {
      const userId = this.rental.user.uuid;
      const token = localStorage.getItem('token');
      api
          .get(`/api/v1/admin/users/${userId}`)
          .then((response) => {
            this.user = response.data.data;

          })
          .catch((error) => {
            console.log(error);
          });
    },
    fetchCarProfile() {
      const carId = this.rental.car.uuid;
      const token = localStorage.getItem('token');
      api
          .get(`/api/v1/admin/cars/${carId}`)
          .then((response) => {
            this.car = response.data.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

</style>
