<template>
  <div>
    <h1>Car Management</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="Search...">
      <button @click="resetSearch">Reset</button>
    </div>
    <router-link to="/admin/cars/create" class="add-car-link">
      Add New Car
    </router-link>
    <table>
      <thead>
      <tr>
        <th @click="sortCars('id')">ID</th>
        <th @click="sortCars('make')">Make</th>
        <th @click="sortCars('model')">Model</th>
        <th @click="sortCars('year')">Year</th>
        <th @click="sortCars('category')">Category</th>
        <th @click="sortCars('priceGroup')">Price Group</th>
        <th>Actions</th>
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
        <td>
          <template v-if="!car.editing">
            <button @click="deleteCar(car.id)" class="delete-button">Delete</button>
            <button @click="editCar(car)" class="update-button">Edit</button>
            <button @click="openCarView(car.id)" class="read-button">Read</button>
          </template>
          <template v-else>
            <button @click="saveCar(car)" class="update-button">Save</button>
            <button @click="cancelEdit(car)" class="delete-button">Cancel</button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <div>
      <!-- Existing code -->
      <div v-if="showConfirmationModal">
          <confirmation-modal
              :show="showConfirmationModal"
              @cancel="cancelDelete"
              @confirm="confirmDelete"
          ></confirmation-modal>
        </div>


    </div>

  </div>
</template>

<script>
import axios from "axios";
import ConfirmationModal from "../../ConfirmationModal.vue";

export default {
  data() {
    return {
      cars: [], // Placeholder for the list of cars
      loading: false,
      sortBy: "",
      searchQuery: "",
      showConfirmationModal: false, // Flag to show/hide the confirmation modal
    };
  },
  components: {
    ConfirmationModal,
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
      axios
          .get(`http://localhost:8080/api/admin/cars/all`)
          .then((response) => {
            this.cars = response.data;
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    deleteCar(carId) {
      this.showConfirmationModal = true;
      // Store the car ID that is being deleted for future reference
      this.carToDeleteId = carId;
    },
    cancelDelete() {
      this.showConfirmationModal = false;
      this.carToDeleteId = null;
    },
    confirmDelete() {
      // Perform the delete operation for the car
      if (this.carToDeleteId) {
        axios
            .delete(`http://localhost:8080/api/admin/cars/delete/${this.carToDeleteId}`)
            .then((response) => {
              this.fetchCars();
              console.log(response);
              console.log('Car deleted');
            })
            .catch((error) => {
              console.log(error);
              console.log('Car not deleted');
            });
      }
      // Close the confirmation modal
      this.showConfirmationModal = false;
      this.carToDeleteId = null;
    },

    openCarView(carId) {
      this.$router.push(`/admin/cars/read/${carId}`);
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
      // Perform save/update logic here
      this.pushUpdatedCar(car);
      car.editing = false;
    },
    pushUpdatedCar(car) {
      axios
          .put(`http://localhost:8080/api/admin/cars/update/${car.id}`, car)
          .then((response) => {
            console.log(response);
            console.log("Car updated");
          })
          .catch((error) => {
            console.log(error);
            console.log("Car not updated");
          });
    },
    cancelEdit(car) {
      car.editing = false;
    },
  },
  created() {
    this.fetchCars(); // Fetch cars when the component is created
  },
};
</script>

<style scoped>
.add-car-link {
  margin-bottom: 1rem;
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

th {
  padding: 0.5rem;
  text-align: left;
  cursor: pointer;
}

td {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
}

.delete-button {
  background-color: #e53935;
}

.update-button {
  background-color: #ff9800;
}

.read-button {
  background-color: #2196f3;
}

.loading {
  margin-top: 1rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  padding: 0.5rem;
  width: 300px;
  margin-right: 1rem;
}

.search-bar button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  background-color: #2196f3;
}
</style>
