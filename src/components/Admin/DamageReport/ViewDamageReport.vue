<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="report-profile">
        <div class="form-header">
          <h2><i class="fas fa-exclamation-triangle"></i> Damage Report Profile</h2>
        </div>

        <hr/>
        <div class="profile-details" v-if="damageReport && rental && user && car">
          <div class="section">

            <h3><i class="fas fa-exclamation-triangle"></i> Report Details:</h3>
            <hr/>
            <div class="detail-row">
              <div>
                <label>ID:</label>
                <span>{{ damageReport.uuid }}</span>
              </div>
              <div>
                <label>Description:</label>
                <span>{{  damageReport.description}}</span>
              </div>
              <div>
                <label>Date & Time:</label>
                <span>{{formatDateTime(  damageReport.dateAndTime) }}</span>
              </div>
              <div>
                <label>Location:</label>
                <span>{{ damageReport.location }}</span>
              </div>
              <div>
                <label>Repair Cost:</label>
                <span>{{ damageReport.repairCost }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3><i class="fas fa-file-alt"></i> Rental Details:</h3>
            <hr/>
            <div class="detail-row">
              <div>
                <label>ID:</label>
                <span>{{ rental.uuid }}</span>
              </div>
              <div>
                <label>Rental Date:</label>
                <span>{{formatDateTime( rental.issuedDate )}}</span>
              </div>
              <div>
                <label>Return Date:</label>
                <span>{{ formatDateTime( rental.returnedDate) }}</span>
              </div>
              <div>
                <label>Fine:</label>
                <span>{{ rental.fine }}</span>
              </div>
            </div>
          </div>
          <div class="section">
            <h3><i class="fas fa-user"></i> Customer Details:</h3>
            <hr/>
            <div class="detail-row">
              <div>
                <label>ID:</label>
                <span>{{ user.uuid }}</span>
              </div>
              <div>
                <label>Customer Name:</label>
                <span>{{ user.firstName }} {{ user.lastName }}</span>
              </div>
              <div>
                <label>Email:</label>
                <span>{{ user.email }}</span>
              </div>

            </div>
          </div>

          <div class="section">
            <h3><i class="fas fa-car"></i> Car Details:</h3>
            <hr/>
            <div class="detail-row">
              <div>
                <label>ID:</label>
                <span>{{ car.uuid }}</span>
              </div>
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
                <label>License Plate:</label>
                <span>{{ car.licensePlate }}</span>
              </div>
            </div>
          </div>
          <hr/>
        </div>

        <div v-else>
          <p>Loading report profile...</p>
        </div>
      </div>
      <div class="button-container">
        <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import api from "@/api";

// Add interceptor to automatically attach token
axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

export default {
  name: "ViewDamageReport",
  data() {
    return {
      damageReport: null,
      rental: null,
      user: null,
      car: null,
    };
  },
  mounted() {
    this.fetchDamageReport();

  },
  methods: {
    fetchDamageReport() {
      const reportId = this.$route.params.uuid;

      api
          .get(`/api/v1/admin/damage-reports/${reportId}`)
          .then((response) => {
            console.log("Response Fetching Damage Report:", response);
            this.damageReport = response.data.data;
            /*  console.log(this.damageReport);
              console.log(this.damageReport.id);
              console.log(this.damageReport.rental.id);
              console.log(this.damageReport.rental.user.id);
              console.log(this.damageReport.rental.car.id);*/
            // Fetch related profiles
            this.fetchRentalProfile();
            this.fetchUserProfile();
            this.fetchCarProfile();
          })
          .catch((error) => {
            console.log("Error fetching damage report:", error);
          });
    },

    fetchRentalProfile() {
      const rentalId = this.damageReport.rental.uuid;

      api
          .get(`/api/v1/admin/rentals/${rentalId}`)
          .then((response) => {
            console.log("Response Fetching Rental:");
            this.rental = response.data.data;
            console.log(response);
            // console.log(this.rental.user);

          })
          .catch((error) => {
            console.log("Error fetching rental:", error);
          });
    },

    fetchUserProfile() {
      const userId = this.damageReport.rental.user.uuid;

      api
          .get(`/api/v1/admin/users/${userId}`)
          .then((response) => {
            console.log("Response Fetching User:");
            // console.log(response);
            this.user = response.data.data;
            // console.log(this.user);

          })
          .catch((error) => {
            console.log("Error fetching user:", error);
          });
    },

    fetchCarProfile() {
      const carId = this.damageReport.rental.car.uuid;

      api
          .get(`/api/v1/admin/cars/${carId}`)
          .then((response) => {
            console.log("Response Fetching Car:");
            this.car = response.data.data;
            // console.log(this.car);
          })
          .catch((error) => {
            console.log("Error fetching car:", error);
          });
    },
    formatDateTime(dateTimeStr) {
      const options = {
        year: 'numeric',
        month: 'short', // 'long' for full month name
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return new Date(dateTimeStr).toLocaleString('en-ZA', options);
    },
    goBack() {
      this.$router.go(-1);
    },

  },
};
</script>

<style scoped>
/* Add your scoped styles here if needed */
</style>
