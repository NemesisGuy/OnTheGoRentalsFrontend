<template>
  <div class="card-container">
    <div class="booking"><!--this should be a from ???-->
      <div class="form-header">
        <h1>Booking</h1>
      </div>
      <hr>
      <!-- User Information -->
      <div class="user-details">
        <h2 style="color: black;">User Information</h2><!--please remove the inline styles thats a big ISSUE -->
        <div class="form-group">
          <label for="userName">Username:</label>
          <input id="userName" v-model="user.userName" class="custom-input" required type="text">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="user.email" class="custom-input" required type="email">
        </div>
      </div>
      <!-- Booking Dates -->
      <div class="date-details">
        <h2 style="color: black;">Booking Dates</h2><!--please remove the inline styles thats a big ISSUE -->
        <div class="form-group">
          <label for="startDate">Start Date:</label>
          <input id="startDate" v-model="booking.startDate" class="custom-input" required type="date">
        </div>
        <div class="form-group">
          <label for="endDate">End Date:</label>
          <input id="endDate" v-model="booking.endDate" class="custom-input" required type="date">
        </div>
      </div>
      <!-- Car Selection -->
      <div class="car-details">
        <h2 style="color: black;">Select a Car</h2><!--please remove the inline styles thats a big ISSUE -->
        <select v-model="selectedCar" class="custom-dropdown" @change="calculatePrice">
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
      <div class="button-container">
        <button class="add-button button" @click="openBookingPage"><i class="fas fa-check"></i> Confirm</button>
      </div>
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


.booking {
  width: 650px;
  height: 100%;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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


.car-details, .user-details, .date-details {
  margin-bottom: 20px;
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
