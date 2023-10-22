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
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3>Customer Details:</h3>
            <hr />
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

          <!-- Car Details -->
          <div class="section">
            <h3>Car Details:</h3>
            <hr />
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
      const carId = this.booking.car.id;

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
  display: flex;
  padding: 50px;
  justify-content: center;
}
.booking-profile {
  margin-top: 20px;
}

.booking-profile h1 {
  margin-bottom: 10px;
}

.profile-details {
  display: flex;
  flex-wrap: wrap;
}

.section {
  flex: 1 1 50%;
  margin-right: 20px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
}

.detail-row > div {
  flex: 1 1 50%;
  display: flex;
  align-items: center;
}

label {
  font-weight: bold;
  margin-right: 10px;
}

span {
  margin-right: 10px;
}

/* Media query for narrow screens */
@media (max-width: 500px) {
  .profile-details {
    flex-direction: column; /* Stack sections vertically */
  }

  .section {
    margin-right: 0;
  }
}
</style>
