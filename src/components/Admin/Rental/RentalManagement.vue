
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
        <router-link class="add-button rental-button" to="/admin/rentals/create">
          <i class="fas fa-file-contract"></i> Add New Rental
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
      <tbody v-if="!loading">
      <tr v-for="rental in filteredRentals" :key="rental.id">
        <td>{{ rental.rentalId }}</td>
        <td>{{ rental.user ? rental.user.userName : '' }}</td>
        <td>{{ rental.user ? rental.user.firstName : '' }}</td>
        <td>{{ rental.user ? rental.user.lastName : '' }}</td>
        <td>{{ rental.car ? rental.car.make : '' }}</td>
        <td>{{ rental.car ? rental.car.model : '' }}</td>
        <td>{{ rental.issuer }}</td>
        <td>{{ rental.issuedDate }}</td>

        <td>{{ rental.returnedDate }}</td>
        <td>{{ rental.receiver }}</td>
        <td>{{ rental.finePayed }}</td>

          <!-- other table cells -->
          <td>
            <button class="delete-button" @click="deleteRental(rental)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <template v-if="!rental.editing">
              <button class="update-button" @click="editRental(rental)">
                <i class="fas fa-edit"></i> Edit
              </button>
            </template>
            <template v-else>
              <button class="update-button" @click="saveRental(rental)">
                <i class="fas fa-save"></i> Save
              </button>
              <button class="delete-button" @click="cancelEdit(rental)">
                <i class="fas fa-times"></i> Cancel
              </button>
            </template>
            <button class="read-button" @click="openRentalView(rental)">
              <i class="fas fa-eye"></i> Read
            </button>
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
          <p>User: {{ rentalToDelete.user.userName }}</p>
          <p>Car: {{ rentalToDelete.car.model }}</p>
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
      sortedRentals: [],
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
    };
  },
  methods: {
    getRentals() {
      this.loading = true;
      axios
          .get("http://localhost:8080/api/admin/rentals/list/all")
          .then((response) => {
            this.rentals = response.data;
            this.sortedRentals = response.data;
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to fetch rentals. Please try again.");
          });
    },
    sortRentals(sortKey) {
      this.sortedRentals = this.sortedRentals.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1;
        if (a[sortKey] > b[sortKey]) return 1;
        return 0;
      });
    },
    deleteRental(rental) {
      this.rentalToDelete = rental;
      this.showConfirmationModal = true;
    },
    confirmDeleteRental() {
      if (this.rentalToDelete) {
        const rentalId = this.rentalToDelete.id;
        this.loading = true;
        axios
            .delete(`http://localhost:8080/api/admin/rentals/delete/${rentalId}`)
            .then(() => {
              this.showSuccessModal("Rental deleted successfully.");
              this.getRentals();
            })
            .catch((error) => {
              this.loading = false;
              this.showFailureModal("Failed to delete rental. Please try again.");
            });
      }
      this.rentalToDelete = null;
      this.showConfirmationModal = false;
    },
    cancelDeleteRental() {
      this.rentalToDelete = null;
      this.showConfirmationModal = false;
    },
    editRental(rental) {
      rental.editing = true;
    },
    saveRental(rental) {
      rental.editing = false;
      this.loading = true;
      axios
          .put(`http://localhost:8080/api/admin/rentals/update/${rental.rentalId}`, rental)
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
      this.$router.push(`/admin/rentals/read/${rentalId}`);
    },
    resetSearch() {
      this.searchQuery = "";
      this.sortedRentals = this.rentals;
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
  },
  computed: {
    filteredRentals() {
      if (!this.searchQuery) {
        return this.sortedRentals;
      }
      return this.sortedRentals.filter((rental) => {
        return (
            rental.rentalId.toString().includes(this.searchQuery.toLowerCase()) ||
            rental.user.userName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            rental.car.make.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            rental.car.model.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            rental.issuer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            rental.issuedDate.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            rental.dateReturned.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            rental.receiver.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    },
  },
  created() {
    this.getRentals();
  },
};
</script>