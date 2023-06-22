<template>
  <div class="content-container">
    <h1>List of {{ category }} Cars</h1>
    <loading-modal v-if="loading" show />
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
      <tr v-for="car in sortedCars" :key="car.id">
        <td>{{ car.id }}</td>
        <td>{{ car.make }}</td>
        <td>{{ car.model }}</td>
        <td>{{ car.year }}</td>
        <td>{{ car.category }}</td>
        <td>{{ car.priceGroup }}</td>
        <td>{{ car.licensePlate }}</td>
        <td>
          <button class="rent-button" @click="rentCar(car)"><i class="fas fa-handshake"></i> Rent</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';

export default {
  name: 'CarList',
  components: {
    LoadingModal,
  },
  data() {
    return {
      cars: [],
      category: '',
      sortColumn: '',
      sortDirection: '',
      loading: false,
    };
  },
  mounted() {
    this.fetchCars();
  },
  methods: {
    fetchCars() {
      this.loading = true;
      const category = this.$route.params.category;
      axios
          .get(`http://localhost:8080/api/cars/list/${category}`)
          .then((response) => {
            this.cars = response.data;
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
    rentCar(car) {
      // Perform the rental process here
      console.log('Renting car:', car);

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

