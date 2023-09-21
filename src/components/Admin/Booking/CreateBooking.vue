<template>
    <div class="card-container">
      <div class="rental-profile">
        <h1>Booking Profile</h1>
        <hr>
        <div class="profile-details" v-if="booking && user && car">
          <div class="section">
            <h3>Booking Details:</h3>
            <hr>
            <div class="detail-row">
              <div>
                <label>Booking ID:</label>
                <span>{{ booking.bookingId }}</span>
              </div>
              <div>
                <label>Booking Date:</label>
                <span>{{ booking.issuedDate }}</span>
              </div>
              <div>
                <label>Return Date:</label>
                <span>{{ booking.returnedDate }}</span>
              </div>
              <div>
                <label>Fine:</label>
                <span>{{ booking.fine }}</span>
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
          <p>Loading booking profile...</p>
        </div>
      </div>
    </div>
  </template>
  
  
  
  <script>
import axios from 'axios';

export default {
  name: 'ViewBooking',
  data() {
    return {
      booking: null,
      user: null,
      car: null,
    };
  },
  mounted() {
    this.fetchBookingProfile();
  },
  methods: {
    fetchBookingProfile() {
      const bookingId = this.$route.params.id;

      axios
          .get(`http://localhost:8080/api/admin/bookings/read/${bookingId}`)
          .then((response) => {
            this.booking = response.data;
            this.fetchUserProfile();
            this.fetchCarProfile();
          })
          .catch((error) => {
            console.log(error);
          });
    },
    fetchUserProfile() {
      const userId = this.booking.user.id;

      axios
          .get(`http://localhost:8080/api/admin/users/read/${userId}`)
          .then((response) => {
            this.user = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    fetchCarProfile() {
      const carId = this.car.id;

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