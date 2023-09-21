<template>
  <div class="card-container">
    <div class="booking">
      <h1>Booking</h1>
      <hr>
      <!-- User Information -->
      <div class="user-details">
        <h2 style="color: black;">User Information</h2>
        <div class="form-group">
          <label for="userName">Username:</label>
          <input type="text" id="userName" v-model="user.userName" required class="custom-input">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="user.email" required class="custom-input">
        </div>
      </div>
      <!-- Booking Dates -->
      <div class="date-details">
        <h2 style="color: black;">Booking Dates</h2>
        <div class="form-group">
          <label for="startDate">Start Date:</label>
          <input type="date" id="startDate" v-model="booking.startDate" required class="custom-input">
        </div>
        <div class="form-group">
          <label for="endDate">End Date:</label>
          <input type="date" id="endDate" v-model="booking.endDate" required class="custom-input">
        </div>
      </div>
      <!-- Car Selection -->
<div class="car-details">
  <h2 style="color: black;">Select a Car</h2>
  <select v-model="selectedCar" @change="calculatePrice" class="custom-dropdown">
    <option value="">Select a Car</option>
    <option value="AUDI A3">AUDI A3</option>
    <option value="BMW">BMW</option>
    <option value="RANGE ROVER">RANGE ROVER</option>
    <option v-for="car in cars" :key="car.id" :value="car.make + ' ' + car.model">
      {{ car.make }} {{ car.model }}
    </option>
  </select>
  <p v-if="selectedCar" style="color: black;">
    Price per Day: R {{ getPricePerDay(selectedCar.priceGroup) }}
  </p>
</div><!-- Car Selection -->

      <button class="booking-button" @click="openBookingPage">Booking</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Booking',
  data() {
    return {
      Bookings: null,
      originalBookings: null,
      selectedCategory: 'All',
      user: {
        userName: '',
        email: ''
      },
      booking: {
        startDate: '',
        endDate: ''
      }
    };
  },
  computed: {
    filteredBookings() {
      if (this.selectedCategory === 'All') {
        return this.Bookings;
      } else {
        return this.Bookings.filter(entry => entry.category === this.selectedCategory);
      }
    }
  },
  mounted() {
    this.fetchBookings();
  },
  methods: {
    fetchBookings() {
      axios
        .get('http://localhost:8080/api/booking/get-all')
        .then((response) => {
          this.Bookings = response.data;
          this.originalBookings = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    openBookingPage() {
      this.$router.push('/booking');
    },
    bookCar() {
      // Make the API call to book the car
      const bookingData = {
        userName: this.user.userName,
        email: this.user.email,
        startDate: this.booking.startDate,
        endDate: this.booking.endDate,
      };
      // Add your booking logic here
    }
  }
};
</script>

<style scoped>
/* Your existing CSS styles for the rest of the component */
</style>


<style scoped>
.card-container {
  display: flex;
  justify-content: center;
  background-color: #f2105e;
  padding: 30px;
}

.booking {
  width: 650px;
  height: 100%;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.booking h1 {
  margin-bottom: 20px;
  text-align: center;
  color: #555;
}

.filter-container {
  display: flex;
  align-items: center;
}

.custom-dropdown,
.custom-input {
  font-size: 18px;
  padding: 12px 16px;
  border-radius: 10px;
  width: 100%;
}

.filter-dropdown:focus {
  outline: none;
}

.filter-dropdown option {
  background-color: #fff;
  color: #333;
}

.filter-dropdown option:hover {
  background-color: #f2105e;
  color: #fff;
}

.booking-button {
  font-size: 16px;
  padding: 12px 25px;
  margin-left: 25px;
  border-radius: 9px;
  background-color: #f2105e;
  color: #fff;
  border: none;
  cursor: pointer;
}

.booking-button:focus {
  outline: none;
}

.booking-button:hover {
  background-color: #ff005a;
}

.booking hr {
  border: none;
  border-top: 2px solid #f2105e;
  margin: 20px 0;
}

.car-details, .user-details, .date-details {
  margin-bottom: 20px;
}

label {
  font-weight: bold;
  color: black; 
}

input[type="date"] {
  padding: 12px 16px;
  border: 1px solid #000000;
  border-radius: 10px;
}

.booking p, .booking h3 {
  text-align: start;
  margin: 0;
}

.booking h3 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
}

.booking p {
  font-size: 1.2em;
  color: #555;
}
</style>
