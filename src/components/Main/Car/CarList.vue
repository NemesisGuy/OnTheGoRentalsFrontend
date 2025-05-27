<template>
  <div class="content-container">
    <h1>List of {{ category }} Cars</h1>
    <loading-modal v-if="loading" show/>
    <table>
      <thead>
      <tr>
        <th @click="sortCars('id')">ID</th>
        <th @click="sortCars('make')">Make</th>
        <th @click="sortCars('model')">Model</th>
        <th @click="sortCars('year')">Year</th>
        <th @click="sortCars('category')">Category</th>
        <th @click="sortCars('priceGroup')">Price Group</th>
        <th @click="sortCars('licensePlate')">License Plate</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="car in sortedCars" :key="car.uuid">
        <td>{{ car.uuid }}</td>
        <td>{{ car.make }}</td>
        <td>{{ car.model }}</td>
        <td>{{ car.year }}</td>
        <td>{{ car.category }}</td>
        <td>{{ car.priceGroup }}</td>
        <td>{{ car.licensePlate }}</td>
        <td>
          <button class="accept-button button" @click="bookCar(car)"><i class="fas fa-handshake"></i> Book</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div class="button-container">
      <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>

    </div>
  </div>
  <FailureModal v-if="failModal.show" @close="closeFailureModalAndRedirectToLogin" @cancel="closeModal" :show="failModal.show"
                :message="failModal.message"></FailureModal>
</template>

<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import api from "@/api";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

export default {
  name: 'CarList',
  components: {
    LoadingModal,
    FailureModal,
  },
  data() {
    return {
      cars: [],
      category: '',
      sortColumn: '',
      sortDirection: '',
      loading: false,

      failModal: {
        show: false,
        message: "",
      },
    };
  },
  mounted() {
    this.fetchCars();
  },
  methods: {
    fetchCars() {
      this.loading = true;
      const category = this.$route.params.category;
      const available = this.$route.params.available === 'true'; // Convert the string to boolean

      let endpoint = `/api/v1/cars`;

      if (available) {
        endpoint = `/api/v1/cars/available`;
      }

      api
          .get(endpoint)
          .then((response) => {
            this.cars = response.data.data;
            this.category = category;
            this.loading = false;
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
          });

    },
    sortCars(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    bookCar(car) {
      // Perform the booking process here
      //push to login if not logged in
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // User is not logged in, show modal saying we will redirect to login
        this.showFailureModal("You need to be logged in to book a car. Redirecting to login page...");


      }else{
      console.log('Booking car:', car);
      //this.$router.push(`/booking/${car.id}`);
      this.$router.push({ name: 'Booking', params: { carUuid: car.uuid } });}



    },
    showFailureModal(message) {
      this.failModal = {
        show: true,
        message: message,
      };
    },
    closeFailureModalAndRedirectToLogin() {

        this.failModal.show = false;
        this.$router.push({ name: 'Login' });



    },
    closeModal() {
      this.failModal.show = false;
    },
    goBack() {
      this.$router.go(-1); // Go back to the previous page
    },
  },

  computed: {
    sortedCars() {
      if (this.sortColumn && this.sortDirection) {
        return this.cars.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
          } else {
            return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
        });
      }
      return this.cars;
    },
  },

};
</script>
<style >
.content-container {
  max-width: 100%;
}
</style>

