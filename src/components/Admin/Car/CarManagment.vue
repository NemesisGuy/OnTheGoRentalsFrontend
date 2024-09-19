<template>
  <div class="content-container">

    <div class="content-header">
      <h1><i class="fas fa-car"> </i>
        Car Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
            <div class="search-input">
              <input v-model="searchQuery" placeholder="Search..." type="text" />
              <button @click="resetSearch" class="read-button button">
                <i class="fas fa-search"> </i> Reset
              </button>
            </div>
            <router-link to="/admin/cars/create" class="add-button button">
              <i class="fas fa-car"> </i> Add Car
            </router-link>
        </div>
      </div>

    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortCars('id')">ID  <i class="fas fa-sort"></i></th>
        <th @click="sortCars('make')">Make  <i class="fas fa-sort"></i></th>
        <th @click="sortCars('model')">Model  <i class="fas fa-sort"></i></th>
        <th @click="sortCars('year')">Year  <i class="fas fa-sort"></i></th>
        <th @click="sortCars('category')">Category  <i class="fas fa-sort"></i></th>
        <th @click="sortCars('priceGroup')">Price Group  <i class="fas fa-sort"></i></th>
        <th @click="sortCars('available')">Available  <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="car in filteredCars" :key="car.id">
        <td v-if="!car.editing">{{ car.id }}</td>
        <td v-else>
          <input type="text" v-model="car.id" disabled>
        </td>
        <td v-if="!car.editing">{{ car.make }}</td>
        <td v-else>
          <input type="text" v-model="car.make">
        </td>
        <td v-if="!car.editing">{{ car.model }}</td>
        <td v-else>
          <input type="text" v-model="car.model">
        </td>
        <td v-if="!car.editing">{{ car.year }}</td>
        <td v-else>
          <input type="text" v-model="car.year">
        </td>
        <td v-if="!car.editing">{{ car.category }}</td>
        <td v-else>
          <input type="text" v-model="car.category">
        </td>
        <td v-if="!car.editing">{{ car.priceGroup }}</td>
        <td v-else>
          <input type="text" v-model="car.priceGroup">
        </td>
        <td v-if="!car.editing">
          <input type="checkbox" v-model="car.available" :disabled="car.editing">
        </td>
        <td v-else>
          <input type="checkbox" v-model="car.available">
        </td>
        <td>
          <template v-if="!car.editing">
            <button @click="deleteCar(car.id)" class="delete-button button">
              <i class="fas fa-trash"></i> Delete
              </button>
            <button @click="editCar(car)" class="update-button button"><i class="fas fa-edit"></i> Edit</button>
            <button @click="openCarView(car.id)" class="read-button button"><i class="fas fa-eye"></i> Read</button>
          </template>
          <template v-else>
            <button @click="saveCar(car)" class="update-button button">Save</button>
            <button @click="cancelEdit(car)" class="delete-button button">Cancel</button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <loading-modal v-if="loading" show/>

    <confirmation-modal
        :show="showConfirmationModal"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    >
      <template v-if="carToDelete">
        <div>
          <p>Are you sure you want to delete this Car?</p>
          <hr>
          <p>ID: {{ carToDelete.id }}</p>
          <p>Make: {{ carToDelete.make }}</p>
          <p>Model: {{ carToDelete.model }}</p>
          <p>Year: {{ carToDelete.year }}</p>
          <p>Category: {{ carToDelete.category }}</p>
          <p>Price Group: {{ carToDelete.priceGroup }}</p>
          <p>License Plate: {{ carToDelete.licensePlate }}</p>
          <p>Available: {{ carToDelete.available }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" @close="closeModal" @cancel="closeModal" :show="successModal.show" :message="successModal.message"></SuccessModal>
    <FailureModal v-if="failModal.show"    @close="closeModal" @cancel="closeModal" :show="failModal.show"    :message="failModal.message">   </FailureModal>


  </div>
</template>


<script>
import axios from "axios";
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "../../Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
// Add this line to set a default base URL for your API
axios.defaults.baseURL = 'http://localhost:8080';

// Add an interceptor for every request
axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
);
export default {
  data() {
    return {
      cars: [], // Placeholder for the list of cars
      loading: false,
      sortBy: "",
      searchQuery: "",
      showConfirmationModal: false, // Flag to show/hide the confirmation modal
      carToDelete: null, // Placeholder for the car ID that is being deleted
      successModal: {
        show: false,
        message: ""
      }, // Placeholder for the success modal
      failModal: {
        show: false,
        message: ""
      }, // Placeholder for the failure modal
    };
  },
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  computed: {
    sortedCars() {
      if (this.sortBy) {
        const sorted = [...this.cars];
        sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
        return sorted;
      }
      return this.cars;
    },
    filteredCars() {
      const query = this.searchQuery.toLowerCase();
      return this.sortedCars.filter((car) => {
        for (const key in car) {
          if (
              typeof car[key] === "string" &&
              car[key].toLowerCase().includes(query)
          ) {
            return true;
          }
        }
        return false;
      });
    },
  },
  methods: {
    fetchCars() {
      this.loading = true;
      const token = localStorage.getItem("token");
      axios
          .get("/api/admin/cars/all", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.cars = response.data;
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
            this.failModal.message = "Failed to fetch cars. Please try again.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loading = false;
          });
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },
    deleteCar(carId) {
      this.showConfirmationModal = true;
      this.carToDelete = this.cars.find((car) => car.id === carId);
    },
    cancelDelete() {
      this.showConfirmationModal = false;
      this.carToDelete = null;
    },
    confirmDelete() {
      if (this.carToDelete) {
        this.loading = true;
        const token = localStorage.getItem("token");
        axios
            .delete(`/api/admin/cars/delete/${this.carToDelete.id}`, {

            })
            .then((response) => {
              this.fetchCars();
              console.log(response);
              console.log("Car deleted");
              this.successModal.show = true; // Show success modal
              this.successModal.message = "Car ID: "+this.carToDelete.id+ "was deleted successfully! Please refresh the page to see the changes."
            })
            .catch((error) => {
              console.log(error);
              console.log("Car not deleted");
              this.failModal.show = true; // Show failure modal
              this.failModal.message = error.response.data.message;
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false;
              this.carToDelete = null;

            });
      }
    },
    openCarView(carId) {
      const token = localStorage.getItem("token");
      this.$router.push(`/admin/cars/read/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    sortCars(sortBy) {
      this.sortBy = sortBy;
    },
    resetSearch() {
      this.searchQuery = "";
    },
    editCar(car) {
      car.editing = true;
    },
    saveCar(car) {
      this.pushUpdatedCar(car);
      car.editing = false;
      this.loading = true;
    },
    pushUpdatedCar(car) {
      const token = localStorage.getItem("token");
      axios
          .put(`/api/admin/cars/update/${car.id}`, car, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            console.log(response);
            console.log("Car updated");
            this.loading = false;
            this.successModal.show = true; // Show success modal
            this.successModal.message = "Car ID: " + car.id + " was updated successfully"; // Show success modal


          })
          .catch((error) => {
            console.log(error);
            console.log("Car not updated");
            this.loading = false;
            this.failModal.show = true; // Show fail modal
            this.failModal.message = "Car ID: " + car.id + "was not updated successfully"; // Show success modal

          })
          .finally(() => {
            this.loading = false;


          });
    },
    cancelEdit(car) {
      car.editing = false;
    },
    closeSuccessFailModal() {

      this.successModal.show = false;
      this.failModal.show = false;
    },
  },
  created() {
    this.fetchCars();
  },

};
</script>


<style scoped>

</style>