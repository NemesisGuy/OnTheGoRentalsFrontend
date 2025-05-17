<template xmlns="http://www.w3.org/1999/html">
  <div class="card-container">
    <div class="form-container">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>

      <form ref="bookingForm" @submit.prevent="createBooking">
        <div class="form-header">
          <h2>Create Booking</h2>
        </div>

        <div class="form-group">
          <label for="user">User:</label>
          <input
              id="user"
              type="text"
              :value="`${currentUser.firstName} ${currentUser.lastName}, ${currentUser.email}`"
              readonly
          />
        </div>

        <div class="form-group">
          <label for="issuedDate">Rental Collection Date:</label>
          <input id="issuedDate" v-model="selectedIssuedDate" name="issuedDate" type="datetime-local">
        </div>

        <div class="form-group">
          <label for="returnedDate">Rental Return Date:</label>
          <input id="returnedDate" v-model="selectedReturnedDate" name="returnedDate" type="datetime-local">
        </div>

        <div class="form-group">
          <label for="car">Car:</label>
          <select id="car" v-model="selectedCar" name="carId">
            <option v-for="car in cars" :key="car.id" :value="car.id">
              Car ID: {{ car.id }} Make: {{ car.make }} Model: {{ car.model }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <div class="button-container">
            <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body">
<!--
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
-->

    <confirmation-modal
        key="confirmationModal"
        :show="showConfirmationModal"
        @cancel="cancel"
        @confirm="confirm"
    >
      <template v-if="showConfirmationModal">
        <div>
          <h3>Confirmation</h3>
          <p>Are you sure you want to create this Booking?</p>
          <hr>
          <p>User: {{ `${currentUser.firstName} ${currentUser.lastName}, ${currentUser.email}` }}</p>
          <p>Issued Date: {{ formatDateTime(selectedIssuedDate) }}</p>
          <p>Returned Date: {{ formatDateTime(selectedReturnedDate) }}</p>
          <p>Car ID: {{ selectedCar }} </p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>

    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeModal"
        @close="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
    ></SuccessModal>

    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    ></FailureModal>
  </div>
</template>


<script>
import axios from "axios";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils";

export default {
  data() {
    return {
      cars: [],
      selectedCar: "",
      selectedIssuedDate: "",
      selectedReturnedDate: "",
      currentUser: {},
      confirm: null,
      cancel: null,
      loadingModal: {
        show: false,
      },
      errorMessage: "",
      showConfirmationModal: false,
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
  components: {
    ConfirmationModal,
    SuccessModal,
    FailureModal,
    LoadingModal,
  },

  mounted() {
    const token = localStorage.getItem("accessToken");
    this.isLoggedIn = !!token;
  },

  created() {
    const token = localStorage.getItem("accessToken");
    this.isLoggedIn = !!token;

    if (this.isLoggedIn) {
      api
          .get("/api/user/profile/read/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            this.currentUser = response.data;
            console.log("Current User:", this.currentUser);
          })
          .catch((error) => {
            console.error("Error fetching user profile:", error);
            this.failModal.message = "Failed to fetch user profile";
            this.failModal.show = true;
          });
    }

    const routeCarId = this.$route.params.carId;
    if (routeCarId) {
      this.selectedCar = routeCarId;
    }else {
      this.selectedCar = "";
    }

    this.fetchCarsList();
  },

  methods: {
    formatDateTime,

    fetchCarsList() {
      const token = localStorage.getItem("accessToken");
      this.isLoggedIn = !!token;
      this.loadingModal.show = true;
      api
          .get("/api/cars/list/available/all", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            this.cars = response.data;
            this.loadingModal.show = false;
          })
          .catch((error) => {
            console.log(error);
            this.failModal.message = "Failed to fetch cars list";
            this.failModal.show = true;
            this.loadingModal.show = false;
          });
    },

    validateInputs() {
      if (!this.selectedIssuedDate || !this.selectedReturnedDate || !this.selectedCar) {
        this.errorMessage = "All fields are required.";
        return false;
      }

      const issue = new Date(this.selectedIssuedDate);
      const returnDate = new Date(this.selectedReturnedDate);
      if (returnDate <= issue) {
        this.errorMessage = "Return date must be after the collection date.";
        return false;
      }

      this.errorMessage = ""; // Clear error if valid
      return true;
    },

    createBooking() {
      const token = localStorage.getItem("accessToken");
      this.isLoggedIn = !!token;

      // Validate inputs before proceeding
      if (!this.validateInputs()) {
        this.failModal.message = this.errorMessage;
        this.failModal.show = true;
        return;
      }

      const booking = {
        user: {
          id: this.currentUser.id,
        },
        car: {
          id: this.selectedCar,
        },
        bookingStartDate: this.selectedIssuedDate,
        bookingEndDate: this.selectedReturnedDate,
        status: "PENDING",
      };

      this.showConfirmationModal = true;

      this.confirm = () => {
        this.loadingModal.show = true;
        this.showConfirmationModal = false;

        api
            .post("/api/bookings/create", booking, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              this.loadingModal.show = false;
              console.log("Booking created successfully");
              this.successModal.message = "Booking created successfully";
              this.successModal.show = true;
            })
            .catch((error) => {
              this.loadingModal.show = false;
              console.log(error);
              this.errorMessage = error.response?.data || "Failed to create booking";
              this.failModal.message = this.errorMessage;
              this.failModal.show = true;
            })
            .finally(() => {
              this.loadingModal.show = false;
            });
      };

      this.cancel = () => {
        this.loadingModal.show = false;
        this.showConfirmationModal = false;
      };
    },

    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },
  },
};
</script>

