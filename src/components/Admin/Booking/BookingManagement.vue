<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-file-contract"></i> Booking Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/bookings/create" class="add-button button">
            <i class="fas fa-contact-book"></i> Add Booking
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th @click="sortBookings('bookingId')">Booking ID <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('user.userName')">User <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('user.firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('user.lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('car.make')">Car Make <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('car.model')">Car Model <i class="fas fa-sort"></i></th>
          <th @click="sortBookings('dateBooked')">Date Booked </th>
          <th @click="sortBookings('dateReturned')">Date Returned </th>
          <th class="actions-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in filteredBookings" :key="booking.bookingId">
          <td v-if="!booking.editing">{{ booking.bookingId }}</td>
          <td v-else>
            <input type="text" v-model="booking.bookingId">
          </td>
          <td v-if="!booking.editing">{{ booking.user.userName }}</td>
          <td v-else>
            <input type="text" v-model="booking.user.userName">
          </td>
          <td v-if="!booking.editing">{{ booking.user.firstName }}</td>
<td v-else>
  <input type="text" v-model="booking.user.firstName">
</td>

          <td v-if="!booking.editing">{{ booking.user.lastName }}</td>
          <td v-else>
            <input type="text" v-model="booking.user.lastName">
          </td>
          <td v-if="!booking.editing">{{ booking.car.make }}</td>
          <td v-else>
            <input type="text" v-model="booking.car.make">
          </td>
          <td v-if="!booking.editing">{{ booking.car.model }}</td>
          <td v-else>
            <input type="text" v-model="booking.car.model">
          </td>
          <td v-if="!booking.editing">{{ booking.dateBooked }}</td>
          <td v-else>
            <input type="text" v-model="booking.dateBooked">
          </td>
          <td v-if="!booking.editing">{{ booking.dateReturned }}</td>
          <td v-else>
            <input type="text" v-model="booking.dateReturned">
          </td>
          <td>
            <div v-if="!booking.editing">
              <button @click="editBooking(booking)" class="update-button button">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button @click="deleteBooking(booking.bookingId)" class="delete-button button">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
              <button @click="openBookingView(booking.bookingId)" class="read-button button">
                <i class="fas fa-eye"></i> View
              </button>
            </div>
            <div v-else>
              <button @click="saveBooking(booking)" class="accept-button button">
                <i class="fas fa-save"></i> Save
              </button>
              <button @click="cancelEdit(booking)" class="cancel-button button">
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
          <p>User: {{ bookingToDelete.user.userName }}</p>
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
      bookings: [],
      sortedBookingsList: [],
      sortBy: null,
      searchQuery: "",
      loading: false,
      showConfirmationModal: false,
      bookingToDelete: null,
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
    getBookings() {
      this.loading = true;
      axios
        .get(`http://localhost:8080/api/admin/bookings/list/all`)
        .then((response) => {
          this.bookings = response.data;
          this.sortedBookingsList = [...this.bookings];
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
      let sortOrder = "asc";

      if (currentSortKey === sortKey && this.sortedBookingsList[0]._sortOrder === "asc") {
        sortOrder = "desc";
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

        return sortOrder === "asc" ? comparison : -comparison;
      });

      this.sortedBookingsList.forEach((booking) => {
        booking._sortKey = sortKey;
        booking._sortOrder = sortOrder;
      });
    },
    getPropertyValue(object, key) {
      const keys = key.split(".");
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
      booking.bookingId = booking.id;
      booking.issuedDate = booking.issuedDate;
      booking.returnedDate = booking.returnedDate;

      axios
        .put(`http://localhost:8080/api/admin/bookings/update/${booking.bookingId}`, booking)
        .then((response) => {
          this.loading = false;
          this.showSuccessModal("Booking updated successfully.");
          console.log(response);
         /* this.getBookings();*/
        })
        .catch((error) => {
          this.loading = false;
          this.showFailureModal("Failed to update booking. Please try again.");
        });
    },
    cancelEdit(booking) {
      booking.editing = false;
    },
    openBookingView(bookingId) {
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
        if (typeof obj[key] === "string" && obj[key].toLowerCase().includes(query)) {
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
          if (typeof booking[key] === "string" && booking[key].toLowerCase().includes(query)) {
            return true;
          }
          if (typeof booking[key] === "object" && this.searchNestedProperty(booking[key], query)) {
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

<style>

</style>
