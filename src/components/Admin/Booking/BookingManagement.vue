<template>
    <div class="content-container">
      <div class="content-header">
        <h1><i class="fas fa-file-contract" ></i>
         Booking Management
        </h1>
        <div class="search-bar">
          <input v-model="searchQuery" placeholder="Search..." type="text">
          <button @click="resetSearch">
            <i class="fas fa-search"> </i> Reset
          </button>
        </div>
        <div>
          <router-link to="/admin/bookings/create" class="add-button ">
            <i class="fas fa-contact-book"> </i> Add New Booking
          </router-link>
        </div>
      </div>
      <table>
        <thead>
        <tr>
          <th @click="sortBookings('id')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('user.userName')">User <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('user.firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('user.lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('car.make')">Make <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('car.model')">Model <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('issuer')">Issuer <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('dateRented')">Date Rented </th>
          <th @click="sortBookings('dateReturned')">Date Returned </th>
          <th @click="sortBookings('receiver')">Receiver </th>
          <th @click="sortBookings('finePaid')">Fine Paid </th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="rental in filteredRentals" :key="rental.rentalId">
          <td v-if="!rental.editing">{{ rental.rentalId  }}</td>
          <td v-else>
            <input type="text" v-model="rental.rentalId " >
          </td>
          <td v-if="!rental.editing">{{ rental.user.userName }}</td>
          <td v-else>
            <input type="text" v-model="rental.user.userName">
          </td>
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
  
          <td v-if="!booking.editing">{{ booking.issuedDate }}</td>
          <td v-else>
          <input type="text" v-model="booking.issuedDate">
        </td>
          <td v-if="!booking.editing">{{ booking.returnedDate }}</td>
          <td v-else>
            <input type="text" v-model="booking.returnedDate">
          </td>
          <td v-if="!booking.editing">{{ booking.receiver }}</td>
          <td v-else>
            <input type="text" v-model="booking.receiver">
          </td>
          <td v-if="!booking.editing">{{ booking.fine }}</td>
          <td v-else>
            <input type="text" v-model="booking.fine">
          </td>
          <td>
            <div v-if="!booking.editing">
              <button @click="editBooking(bookingl)" class="update-button">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button @click="deleteBooking(booking.bookingId)" class="delete-button">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
  
             <button @click="openBookingView(booking.bookingId)" class="read-button"><i class="fas fa-eye"></i> Read</button>
            </div>
            <div v-else>
              <button @click="saveBooking(booking)" class="accept-button">
                <i class="fas fa-save"></i> Save
              </button>
              <button @click="cancelEdit(booking)" class="cancel-button">
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
          @confirm="confirmDeleteBooking"
          @cancel="cancelDeleteBooking"
      >
        <template v-if="bookingToDelete">
          <div>
            <p>Are you sure you want to delete this booking?</p>
            <hr>
            <h3>Booking Details:</h3>
            <p>User: {{ bookingToDelete.user.username }}</p>
            <p>Car: {{ bookingToDelete.car.model }}</p>
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
  const backendUrl = process.env.VUE_APP_BACKEND_URL;
  
  
  
  export default {
    name: "BookingManagement",
    components: {
      ConfirmationModal,
      LoadingModal,
      SuccessModal,
      FailureModal,
    },
    data() {
      return {
        booking: [],
        sortedBookingsList: [],
  
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
  
      getBookings() {
        this.loading = true;
        axios
            .get(`http://localhost:8080/api/admin/bookings/list/all`)
            .then((response) => {
              this.bookings = response.data;
              this.sortedBookingsList = [...this.bookings]; // Assign to data property instead of computed property
              this.loading = false;
            })
  
            .catch((error) => {
              this.loading = false;
              this.showFailureModal("Failed to fetch bookings. Please try again.");
            });
      },
      sortBookings(sortKey) {
        if (this.sortedBookingsList.length === 0) {
          return;
        }
  
        const currentSortKey = this.sortedBookingsList[0]._sortKey;
        let sortOrder = 'asc';
  
        if (currentSortKey === sortKey && this.sortedBookingsList[0]._sortOrder === 'asc') {
          sortOrder = 'desc';
        }
  
        this.sortedBookingsList.sort((a, b) => {
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
  
        this.sortedBookingsList.forEach((booking) => {
          booking._sortKey = sortKey;
          booking._sortOrder = sortOrder;
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
      deleteBooking(booking) {
        this.bookingToDelete = booking;
        this.showConfirmationModal = true;
      },
      confirmDeleteBooking() {
        if (this.bookingToDelete) {
          const bookingId = this.bookingToDelete.id;
          this.loading = true;
          axios
              .delete(`http://localhost:8080/api/admin/bookings/delete/${bookingId}`)
              .then(() => {
                this.showSuccessModal("Booking deleted successfully.");
                this.getBookings();
              })
              .catch((error) => {
                this.loading = false;
                this.showFailureModal("Failed to delete booking. Please try again.");
              });
        }
        this.bookingToDelete = null;
        this.showConfirmationModal = false;
      },
      cancelDeleteBooking() {
        this.bookingToDelete = null;
        this.showConfirmationModal = false;
      },
      editBooking(booking) {
        booking.editing = true;
      },
      saveBooking(booking) {
        booking.id = booking.bookingId;
        console.info("Saving booking: ", booking);
        console.info("Bookingid: ", booking.bookingId);
        console.info("Booking.id: ", booking.id);
        booking.editing = false;
        this.loading = true;
        axios
            .put(`http://localhost:8080/api/admin/bookings/update/${booking.bookingId}`, booking)
            .then(() => {
              this.showSuccessModal("Booking updated successfully.");
              this.getBookings();
            })
            .catch((error) => {
              this.loading = false;
              this.showFailureModal("Failed to update booking. Please try again.");
            });
      },
      cancelEdit(booking) {
        booking.editing = false;
      },
      openBookingView(bookinglId) {
        this.$router.push(`/admin/bookings/read/${bookingId}`);
      },
      resetSearch() {
        this.searchQuery = "";
        this.sortedBookingsList = this.bookings;
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
      sortedBookingsList() {
        if (this.sortBy) {
          const sorted = [...this.bookings];
          sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
          return sorted;
        }
        return this.bookings;
      },
      filteredBookings() {
        const query = this.searchQuery.toLowerCase();
        return this.sortedBookingsList.filter((booking) => {
          for (const key in booking) {
            if (
                typeof booking[key] === 'string' &&
                booking[key].toLowerCase().includes(query)
            ) {
              return true;
            }
            // Check nested properties
            if (
                typeof booking[key] === 'object' &&
                this.searchNestedProperty(booking[key], query)
            ) {
              return true;
            }
          }
          return false;
        });
      },
  
    },
  
    created() {
      this.getBookings();
    },
  
  };
  </script>
  
  