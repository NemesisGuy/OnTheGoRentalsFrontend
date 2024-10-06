<template>
  <div class="card-container">
    <div class="form-container">
      <div class="booking-profile">
        <h1>View Booking</h1>
        <hr />

        <!-- Check if booking, user, and car data is available -->
        <div class="profile-details" v-if="booking && user && car">
          <!-- Booking Details -->
          <div class="section">
            <h3>Booking Details:</h3>
            <hr />
            <div class="detail-row">
              <div>
                <label> ID:</label>
                <span>{{ booking.id }}</span>
              </div>
              <div>
                <label> Status:</label>
                <span>{{ booking.status }}</span>
              </div>
              <div>
                <label>Collection Date:</label>
                <span>{{ booking.bookingStartDate }}</span>
              </div>
              <div>
                <label>Return Date:</label>
                <span>{{ booking.bookingEndDate }}</span>
              </div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3>Customer Details:</h3>
            <hr />
            <div class="detail-row">
<!--              <div>
                <label>Name:</label>
                <span>{{ user.userName }}</span>
              </div>-->
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

          <!-- Car Details -->
          <div class="section">
            <h3>Car Details:</h3>
            <hr />
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
                <label>Group:</label>
                <span>{{ car.priceGroup }}</span>
              </div>
              <div>
                <label>Plate:</label>
                <span>{{ car.licensePlate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Display a message when data is not available -->
        <div v-else>
          <p>Loading booking profile...</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import api from "@/api";

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
      const id = this.$route.params.id;

      api
        .get(`/api/admin/bookings/read/${id}`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
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

      api
        .get(`http://localhost:8080/api/admin/users/read/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
        .then((response) => {
          this.user = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    fetchCarProfile() {
      const carId = this.booking.car.id;

      api
        .get(`/api/admin/cars/read/${carId}`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
