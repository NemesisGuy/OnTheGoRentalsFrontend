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
          .get(`http://localhost:8080/api/admin/rentals/read/${rentalId}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          })
          .then((response) => {
            this.rental = response.data;
            this.fetchUserProfile();
            this.fetchCarProfile();
            console.log("token", localStorage.getItem('token'))
          })
          .catch((error) => {
            console.log(error);
          });
    },
    fetchUserProfile() {
      const userId = this.rental.user.id;
        const token = localStorage.getItem('token');

      axios
          .get(`http://localhost:8080/api/admin/users/read/${userId}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
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
      const carId = this.rental.car.id;

        const token = localStorage.getItem('token');

      axios
          .get(`http://localhost:8080/api/admin/cars/read/${carId}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
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
.card-container {
  display: flex;
  padding: 50px;
  justify-content: center;

}
.rental-profile {
  margin-top: 20px;
}

.rental-profile h1 {
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
