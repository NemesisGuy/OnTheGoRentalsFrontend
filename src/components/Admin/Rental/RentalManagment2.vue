<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-file-contract" ></i>
        Rental Management
      </h1>
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="Search..." type="text">
        <button @click="resetSearch">
          <i class="fas fa-search"> </i> Reset
        </button>
      </div>
      <div>
        <router-link to="/admin/rental/create" class="add-button ">
          <i class="fas fa-contact-book"> </i> Add New Rental
        </router-link>
      </div>

    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortRentals('id')">ID</th>
        <th @click="sortRentals('user.userName')">User</th>
        <th @click="sortRentals('user.firstName')">First Name</th>
        <th @click="sortRentals('user.lastName')">Last Name</th>
        <th @click="sortRentals('car.make')">Make</th>
        <th @click="sortRentals('car.model')">Car</th>

        <th @click="sortRentals('issuer')">Issuer</th>
        <th @click="sortRentals('dateRented')">Date Rented</th>
        <th @click="sortRentals('dateReturned')">Date Returned</th>
        <th @click="sortRentals('receiver')">Receiver</th>
        <th @click="sortRentals('finePaid')">Fine Paid</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>

      <tr v-for="rental in filteredRentals" :key="rental.id">
        <td v-if="!rental.editing">{{ rental.id }}</td>
        <td v-else>
          <input type="text" v-model="rental.id" disabled>
        </td>
        <td v-if="!rental.editing">{{ rental.user }}</td>
        <td v-else>
          <input type="text" v-model="rental.user">
        </td>
        <td v-if="!rental.editing">{{ rental.car }}</td>
        <td v-else>
          <input type="text" v-model="rental.car">
        </td>
        <td v-if="!rental.editing">{{ rental.issuer }}</td>
        <td v-else>
          <input type="text" v-model="rental.issuer">
        </td>
        <td v-if="!rental.editing">{{ rental.receiver }}</td>
        <td v-else>
          <input type="text" v-model="rental.receiver">
        </td>
        <td v-if="!rental.editing">{{ rental.issuedDate }}</td>
        <td v-else>
          <input type="text" v-model="rental.issuedDate">
        </td>
        <td v-if="!rental.editing">{{ rental.returnedDate }}</td>
        <td v-else>
          <input type="text" v-model="rental.returnedDate">
        </td>
        <td v-if="!rental.editing">{{ rental.fine }}</td>
        <td v-else>
          <input type="text" v-model="rental.fine ">
        </td>
        <td>
          <template v-if="!rental.editing">
            <button @click="deleterental(rental)" class="delete-button">
              <i class="fas fa-trash"></i> Delete
              </button>
            <button @click="editrental(rental)"  class="update-button">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button @click="readrental(rental.id)" class="read-button">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button @click="saverental(rental)" class="update-button">Save</button>
            <button @click="cancelEdit(rental)" class="delete-button">Cancel</button>
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
      <template v-if="rentalToDelete">
        <div>
          <p>Are you sure you want to delete this rental?</p>
          <hr>

          <p>Rental ID: {{ rentalToDelete.id }}</p>
          <p>Car ID: {{ rentalToDelete.carId }}</p>
          <p>User ID: {{ rentalToDelete.userId }}</p>
          <p>Issuer: {{ rentalToDelete.issuer }}</p>
          <p>Receiver: {{ rentalToDelete.receiver }}</p>
          <p>Issued Date: {{ rentalToDelete.issuedDate }}</p>
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
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

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
      rentals: [], // Placeholder for the list of rentals
      loading: false,
      sortBy: "",
      searchQuery: "",
      showConfirmationModal: false, // Flag to show/hide the confirmation modal
      rentalToDelete: null, // Placeholder for the rental that is being deleted
      successModal: {
        show: false,
        message: "",
      }, // Placeholder for the success modal
      failModal: {
        show: false,
        message: "",
      }, // Placeholder for the failure modal
    };
  },
  computed: {
    sortedRentals() {
      if (this.sortBy) {
        const sorted = [...this.rentals];
        sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
        return sorted;
      }
      return this.rentals;
    },
    filteredRentals() {
      const query = this.searchQuery.toLowerCase();
      return this.sortedRentals.filter((rental) => {
        for (const key in rental) {
          if (
              typeof rental[key] === "string" &&
              rental[key].toLowerCase().includes(query)
          ) {
            return true;
          }
        }
        return false;
      });
    },
  },
  methods: {
    fetchRentals() {
      this.loading = true;
      axios
          .get("http://localhost:8080/api/admin/rentals/all")
          .then((response) => {
            this.rentals = response.data;
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
            this.failModal.message =
                "Failed to fetch rentals. Please try again.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loading = false;
          });
    },
    deleteRental(rental) {
      this.showConfirmationModal = true;
      this.rentalToDelete = rental;
    },
    cancelDeleteRental() {
      this.showConfirmationModal = false;
      this.rentalToDelete = null;
    },
    confirmDeleteRental() {
      if (this.rentalToDelete) {
        this.loading = true;
        axios
            .delete(
                `http://localhost:8080/api/admin/rentals/delete/${this.rentalToDelete.rentalId}`
            )
            .then((response) => {
              this.fetchRentals();
              console.log(response);
              console.log("Rental deleted");
              this.successModal.show = true;
              this.successModal.message = "Rental ID: " + this.rentalToDelete.rentalId + " was deleted successfully! Please refresh the page to see the changes.";
            })
            .catch((error) => {
              console.log(error);
              console.log("Rental not deleted");
              this.failModal.show = true;
              this.failModal.message = error.response.data.message;
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmation.Modal = false;
            });
      }
    },
    closeSuccessModal() {
      this.successModal.show = false;
    },
    closeFailureModal() {
      this.failModal.show = false;
    },
  },
  mounted() {
    this.fetchRentals();
  },
};
</script>


<style scoped>
/* Add your component's styles here */
</style>


<!--<script>
import axios from "axios";
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";

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
      rentals: [], // Placeholder for the list of rentals
      loading: false,
      sortBy: "",
      searchQuery: "",
      showConfirmationModal: false, // Flag to show/hide the confirmation modal
      rentalToDelete: null, // Placeholder for the rental that is being deleted
      successModal: {
        show: false,
        message: "",
      }, // Placeholder for the success modal
      failModal: {
        show: false,
        message: "",
      }, // Placeholder for the failure modal
    };
  },
  computed: {
    sortedRentals() {
      if (this.sortBy) {
        const sorted = [...this.rentals];
        sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
        return sorted;
      }
      return this.rentals;
    },
    filteredRentals() {
      const query = this.searchQuery.toLowerCase();
      return this.sortedRentals.filter((rental) => {
        for (const key in rental) {
          if (
              typeof rental[key] === "string" &&
              rental[key].toLowerCase().includes(query)
          ) {
            return true;
          }
        }
        return false;
      });
    },
  },
  methods: {
    fetchRentals() {
      this.loading = true;
      axios
          .get("http://localhost:8080/api/admin/rentals/all")
          .then((response) => {
            this.rentals = response.data;
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
            this.failModal.message =
                "Failed to fetch rentals. Please try again.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loading = false;
          });
    },
    deleteRental(rental) {
      this.showConfirmationModal = true;
      this.rentalToDelete = rental;
    },
    cancelDeleteRental() {
      this.showConfirmationModal = false;
      this.rentalToDelete = null;
    },
    confirmDeleteRental() {
      if (this.rentalToDelete) {
        this.loading = true;
        axios
            .delete(
                `http://localhost:8080/api/admin/rentals/delete/${this.rentalToDelete.rentalId}`
            )
            .then((response) => {
              this.fetchRentals();
              console.log(response);
              console.log("Rental deleted");
              this.successModal.show = true;
              this.successModal.message = "Rental ID: " + this.rentalToDelete.rentalId + " was deleted successfully! Please refresh the page to see the changes.";
            })
            .catch((error) => {
              console.log(error);
              console.log("Rental not deleted");
              this.failModal.show = true;
              this.failModal.message = error.response.data.message;
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmation.Modal = false;
            });
      }
    },
    closeSuccessModal() {
      this.successModal.show = false;
    },
    closeFailureModal() {
      this.failModal.show = false;
    },
  },
  mounted() {
    this.fetchRentals();
  },
};
</script>-->
