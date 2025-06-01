<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <router-view></router-view>

      <form ref="bookingForm" @submit.prevent="handleSubmit">
        <div class="form-header">
          <h2><i class="fas fa-calendar-check"></i> Create Booking</h2>
        </div>

        <div class="form-group">
          <label for="user">User:</label>
          <select id="user" v-model="selectedUserUuid" name="userUuid" required>
            <option disabled value="">Please select a user</option>
            <option v-for="user in users" :key="user.uuid" :value="user.uuid">
              Email: {{ user.email }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="issuedDate">Collection Date:</label>
          <input id="issuedDate" v-model="selectedIssuedDate" name="issuedDate" required type="datetime-local">
        </div>

        <div class="form-group">
          <label for="returnedDate">Return Date:</label>
          <input id="returnedDate" v-model="selectedReturnedDate" name="returnedDate" required type="datetime-local">
        </div>

        <div class="form-group">
          <label for="car">Car:</label>
          <select id="car" v-model="selectedCarUuid" name="carUuid" required>
            <option disabled value="">Please select a car</option>
            <option v-for="car in cars" :key="car.uuid" :value="car.uuid">
              Make: {{ car.make }}, Model: {{ car.model }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <div class="button-container">
            <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
            <button type="button" class="back-button button" @click="goBack">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-body">
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelBooking"
        @confirm="confirmBooking"
    >
      <template v-if="showConfirmationModal">
        <div>
          <h3>Confirmation</h3>
          <p>Are you sure you want to create this Booking?</p>
          <hr>
          <p>User UUID: {{ selectedUserUuid }}</p>
          <p>Issued Date: {{ selectedIssuedDate }}</p>
          <p>Returned Date: {{ selectedReturnedDate }}</p>
          <p>Car UUID: {{ selectedCarUuid }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>

    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    ></SuccessModal>

    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    ></FailureModal>
  </div>
</template>

<script>
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import api from "@/api";

export default {
  data() {
    return {
      users: [],
      cars: [],
      selectedUserUuid: "",
      selectedCarUuid: "",
      selectedIssuedDate: "",
      selectedReturnedDate: "",
      loadingModal: false,
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
    this.fetchUsersList();
    this.fetchCarsList();
  },
  methods: {
    fetchUsersList() {
      this.loadingModal = true;
      api
          .get("/api/v1/admin/users", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response) => {
            this.users = response.data.data;
            this.loadingModal = false;
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            this.failModal.message = "Failed to fetch user list";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },

    fetchCarsList() {
      this.loadingModal = true;
      api
          .get("/api/v1/admin/cars", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response) => {
            // Filter for available cars
            this.cars = response.data.data;
            this.loadingModal = false;
          })
          .catch((error) => {
            console.error("Error fetching cars:", error);
            this.failModal.message = "Failed to fetch car list";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },

    handleSubmit() {
      this.errorMessage = "";

      // Basic validation
      if (!this.selectedUserUuid || !this.selectedCarUuid || !this.selectedIssuedDate || !this.selectedReturnedDate) {
        this.errorMessage = "Please fill in all required fields.";
        return;
      }

      // Show confirmation modal
      this.showConfirmationModal = true;
    },

    confirmBooking() {
      this.loadingModal = true;
      this.showConfirmationModal = false;

      const booking = {
        userUuid: this.selectedUserUuid,
        carUuid: this.selectedCarUuid,
        bookingStartDate: this.selectedIssuedDate,
        bookingEndDate: this.selectedReturnedDate,
      };

      api
          .post("/api/v1/admin/bookings", booking, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response) => {
            const bookingData = response.data;
            this.successModal.message = `Booking created successfully:\nUser: ${bookingData.userEmail}\nCar: ${bookingData.carMake} ${bookingData.model}\nIssued Date: ${bookingData.issuedDate}\nReturn Date: ${bookingData.returnDate}`;
            this.successModal.show = true;
            // Reset form
            this.resetForm();
          })
          .catch((error) => {
            this.failModal.message = error.response?.data?.message || "Failed to create booking.";
            this.failModal.show = true;
          })
          .finally(() => {
            this.loadingModal = false;
          });
    },

    cancelBooking() {
      this.showConfirmationModal = false;
      this.errorMessage = "";
    },

    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
      this.errorMessage = "";
    },

    resetForm() {
      this.selectedUserUuid = "";
      this.selectedCarUuid = "";
      this.selectedIssuedDate = "";
      this.selectedReturnedDate = "";
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

</style>