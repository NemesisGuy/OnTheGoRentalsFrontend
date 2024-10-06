<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-file-contract"></i> Rental Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button @click="resetSearch" class="read-button  button">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/rentals/create" class="add-button button">
            <i class="fas fa-contact-book"></i> Add Rental
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortRentals('id')">ID <i class="fas fa-sort"></i></th>
<!--        <th @click="sortRentals('user.userName')">User <i class="fas fa-sort"></i></th>-->
        <th @click="sortRentals('user.firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('user.lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('car.make')">Make <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('car.model')">Model <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('issuer')">Issuer <i class="fas fa-sort"></i></th>
        <th @click="sortRentals('dateRented')">Date Rented </th>
        <th @click="sortRentals('dateReturned')">Date Returned </th>
        <th @click="sortRentals('receiver')">Receiver </th>
        <th @click="sortRentals('finePaid')">Fine Paid </th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="rental in filteredRentals" :key="rental.rentalId">
        <td v-if="!rental.editing">{{ rental.rentalId  }}</td>
        <td v-else>
          <input type="text" v-model="rental.rentalId " >
        </td>
<!--        <td v-if="!rental.editing">{{ rental.user.userName }}</td>
        <td v-else>
          <input type="text" v-model="rental.user.userName">
        </td>-->
        <td v-if="!rental.editing">{{ rental.user.firstName }}</td>
        <td v-else>
          <input type="text" v-model="rental.user.firstName">
        </td>
        <td v-if="!rental.editing">{{ rental.user.lastName }}</td>
        <td v-else>
          <input type="text" v-model="rental.user.lastName">
        </td>
        <td v-if="!rental.editing">{{ rental.car.make }}</td>
        <td v-else>
          <input type="text" v-model="rental.car.make">
        </td>
        <td v-if="!rental.editing">{{ rental.car.model }}</td>
        <td v-else>
          <input type="text" v-model="rental.car.model">
        </td>
        <td v-if="!rental.editing">{{ typeof rental.issuer === 'string' ? rental.issuer.toLowerCase() : rental.issuer }}</td>
        <td v-else>
          <input type="text" v-model="rental.issuer">
        </td>

        <td v-if="!rental.editing">{{ rental.issuedDate }}</td>
        <td v-else>
        <input type="text" v-model="rental.issuedDate">
      </td>
        <td v-if="!rental.editing">{{ rental.returnedDate }}</td>
        <td v-else>
          <input type="text" v-model="rental.returnedDate">
        </td>
        <td v-if="!rental.editing">{{ rental.receiver }}</td>
        <td v-else>
          <input type="text" v-model="rental.receiver">
        </td>
        <td v-if="!rental.editing">{{ rental.fine }}</td>
        <td v-else>
          <input type="text" v-model="rental.fine">
        </td>
        <td>
          <div v-if="!rental.editing">
            <button @click="editRental(rental)" class="update-button button">
              <i class="fas fa-edit"></i> Edit
            </button>
           <button @click="deleteRental(rental.rentalId)" class="delete-button button">
              <i class="fas fa-trash-alt"></i> Delete
            </button>

           <button @click="openRentalView(rental.rentalId)" class="read-button button" ><i class="fas fa-eye"></i> Read</button>
          </div>
          <div v-else>
            <button @click="saveRental(rental)" class="accept-button button">
              <i class="fas fa-save"></i> Save
            </button>
            <button @click="cancelEdit(rental)" class="cancel-button button">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @confirm="confirmDeleteRental"
        @cancel="cancelDeleteRental"
    >
      <template v-if="rentalToDelete">
        <div>
          <p>Are you sure you want to delete this rental?</p>
          <hr>
          <h3>Rental Details:</h3>
         <p> {{ rentalToDelete }} <!--{{ rentalToDelete.user.lastName }}--></p>
<!--          <p>Car: {{ rentalToDelete.car.model }}</p>-->
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" @close="closeModal" @cancel="closeModal" :show="successModal.show" :message="successModal.message"></SuccessModal>
    <FailureModal v-if="failModal.show" @close="closeModal" @cancel="closeModal" :show="failModal.show" :message="failModal.message"></FailureModal>
  </div>
</template>


<script>
import axios from "axios";
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import process from "process";
import baseURL from "@/api.js";
import api from "@/api.js";
/*const backendUrl = process.env.VUE_APP_BACKEND_URL;*/
// Add this line to set a default base URL for your API
/*axios.defaults.baseURL = 'http://localhost:8080';*/

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
  name: "RentalManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      rentals: [],
      sortedRentalsList: [],
     user: {
        id:"", // Get the ID from the route params
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: [{ roleName: "USER" }], // Updated to match the backend structure
      },

      sortBy: null, // Your sort option
      searchQuery: "",
      loading: false,
      showConfirmationModal: false,
      rentalToDelete: null,
      successModal: {
        show: false,
        message: "",
      },
      failModal: {
        show: false,
        message: "",
      },
     /* backendUrl: process.env.VUE_APP_BACKEND_URL,*/
    };
  },
  methods: {

    getRentals() {
      this.loading = true;
      const token = localStorage.getItem('token');
      api
          .get(`/api/admin/rentals/list/all`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.rentals = response.data;
            this.sortedRentalsList = [...this.rentals]; // Assign to data property instead of computed property
            this.loading = false;
          })

          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to fetch rentals. Please try again.");
          });
    },
    sortRentals(sortKey) {
      if (this.sortedRentalsList.length === 0) {
        return;
      }

      const currentSortKey = this.sortedRentalsList[0]._sortKey;
      let sortOrder = 'asc';

      if (currentSortKey === sortKey && this.sortedRentalsList[0]._sortOrder === 'asc') {
        sortOrder = 'desc';
      }

      this.sortedRentalsList.sort((a, b) => {
        const valueA = this.getPropertyValue(a, sortKey);
        const valueB = this.getPropertyValue(b, sortKey);

        let comparison = 0;
        if (valueA > valueB) {
          comparison = 1;
        } else if (valueA < valueB) {
          comparison = -1;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      this.sortedRentalsList.forEach((rental) => {
        rental._sortKey = sortKey;
        rental._sortOrder = sortOrder;
      });
    },
    getPropertyValue(object, key) {
      const keys = key.split('.');
      let value = object;
      for (const k of keys) {
        value = value[k];
      }
      return value;
    },
    deleteRental(rental) {
      console.log("Deleting rental: ", rental);
      this.rentalToDelete = rental;
      this.showConfirmationModal = true;
    },
    confirmDeleteRental() {
      if (this.rentalToDelete) {
      //  const rentalId = this.rentalToDelete.rentalId;  //was this
        const rentalId = this.rentalToDelete;  //should be this LMAO
        console.log("Deleting rental with id: ", rentalId);
        this.loading = true;
        const token = localStorage.getItem('token');
        api
            .delete(`/api/admin/rentals/delete/${rentalId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then(() => {
              this.showSuccessModal("Rental deleted successfully.");
              this.getRentals();
            })
            .catch((error) => {
              this.loading = false;
              this.showFailureModal("Failed to delete rental. Please try again.");
            });
      }
      this.showConfirmationModal = false;
    },
    cancelDeleteRental() {
      this.rentalToDelete = null;
      this.showConfirmationModal = false;
    },
    editRental(rental) {
      rental.editing = true;
      rental.id = rental.rentalId; // Add this line to set rental.id to rental.rentalId
      console.log("Editing rental button sent this id: ", rental.id );
    },
    saveRental(rental) {
      // Create a temporary rental object without authorities
      const tempRental = {
        rentalId: rental.id, // Add the rentalId
        userId: rental.user.id, // Add the userId
        carId: rental.car.id, // Add the carId
        receiver: rental.receiver,
        issuer: rental.issuer,
        issuedDate: rental.issuedDate,
        returnedDate: rental.returnedDate,

        fine: Math.floor(rental.fine),
        // Add other properties as needed
      };
      console.log("tempid sent this id: ", tempRental.rentalId);
      console.info("Saving rental: ", tempRental);

      // Send the temporary rental object to the backend
      this.loading = true;
      const token = localStorage.getItem('token');
      api
          .put(`/api/admin/rentals/update/${tempRental.rentalId}`, tempRental, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(() => {
            this.showSuccessModal("Rental updated successfully.");
            this.getRentals();
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to update rental. Please try again.");
          });
    },
    cancelEdit(rental) {
      rental.editing = false;
    },

    openRentalView(rentalId) {
      const token = localStorage.getItem('token');
      this.$router.push(`/admin/rentals/read/${rentalId}`
          , {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
    },
    resetSearch() {
      this.searchQuery = "";
      this.sortedRentalsList = this.rentals;
    },
    showSuccessModal(message) {
      this.successModal = {
        show: true,
        message: message,
      };
    },
    showFailureModal(message) {
      this.failModal = {
        show: true,
        message: message,
      };
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    searchNestedProperty(obj, query) {
      for (const key in obj) {
        if (
            typeof obj[key] === 'string' &&
            obj[key].toLowerCase().includes(query)
        ) {
          return true;
        }
      }
      return false;
    },
    updateSortOption(option) {
      this.sortBy = option;
    },
  },



  computed: {
    sortedRentalsList() {
      if (this.sortBy) {
        const sorted = [...this.rentals];
        sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
        return sorted;
      }
      return this.rentals;
    },
    filteredRentals() {
      const query = this.searchQuery.toLowerCase();
      return this.sortedRentalsList.filter((rental) => {
        for (const key in rental) {
          if (
              typeof rental[key] === 'string' &&
              rental[key].toLowerCase().includes(query)
          ) {
            return true;
          }
          // Check nested properties
          if (
              typeof rental[key] === 'object' &&
              this.searchNestedProperty(rental[key], query)
          ) {
            return true;
          }
        }
        return false;
      });
    },



  },


  created() {
    this.getRentals();
  },

};
</script>

<style >

</style>