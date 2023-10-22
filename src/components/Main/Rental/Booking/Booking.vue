<template xmlns="http://www.w3.org/1999/html">
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>

      <form ref="bookingForm" @submit.prevent="createBooking">
        <div class="form-header">
          <h2>Create Booking</h2>
        </div>
        
        <div class="form-group">
          <label for="user">User:</label>
          <select id="user" v-model="selectedUser" name="userId">
            <option v-for="user in users" :key="user.id" :value="user.id">
              User ID: {{ user.id }} Email: {{ user.email }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="issuedDate">Issued Date:</label>
          <input id="issuedDate" v-model="selectedIssuedDate" name="issuedDate" type="datetime-local">
        </div>

        <div class="form-group">
  <label for="returnedDate">Returned Date:</label>
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
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- Add the LoadingModal component -->

    <!-- Add the ConfirmationModal component -->
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
          <p>User ID: {{ selectedUser }}</p>
          <p>Issued Date: {{ selectedIssuedDate }}</p>
          <p>Returned Date: {{ selectedReturnedDate }}</p>
          <p>Car ID: {{ selectedCar }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>

    <!-- Add the SuccessModal component -->
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

    <!-- Add the FailureModal component -->
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

export default {
  computed: {
    confirmationModal() {
      return ConfirmationModal;
    }
  },
  data() {
    return {
      users: [],
      cars: [],
      selectedUser: "",
      selectedCar: "",
      selectedIssuedDate: "",
      selectedReturnedDate: "",
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
    this.fetchUsersList();
    this.fetchCarsList();
  },
  methods: {
    fetchUsersList() {
      this.loadingModal.show = true;
      axios
        .get("http://localhost:8080/api/admin/users/list/all")
        .then((response) => {
          this.users = response.data;
          this.loadingModal.show = false;
        })
        .catch((error) => {
          console.log(error);
          this.failModal.message = "Failed to fetch users list";
          this.failModal.show = true;
          this.loadingModal.show = false;
        })
        .finally(() => {
          this.loadingModal.show = false;
        });
    },

    fetchCarsList() {
      this.loadingModal.show = true;
      axios
        .get("http://localhost:8080/api/admin/cars/all")
        .then((response) => {
          this.cars = response.data;
          this.loadingModal.show = false;
        })
        .catch((error) => {
  console.log(error);
  this.failModal.message = "Failed to fetch cars list";
  this.failModal.show = true;
  this.loadingModal.show = false;
})

        .finally(() => {
          this.loadingModal.show = false;
        });
    },

    createBooking() {
      this.loadingModal.show = true;
      this.errorMessage = "";

      const booking = {
        user: {
          id: this.selectedUser,
        },
        car: {
          id: this.selectedCar,
        },
        issuedDate: this.selectedIssuedDate,
        returnedDate: this.selectedReturnedDate,
      };

      this.showConfirmationModal = true;

      this.confirm = () => {
        this.loadingModal.show = true;
        this.showConfirmationModal = false;

        axios
          .post("http://localhost:8080/api/admin/bookings/create", booking)
          .then((response) => {
            if (response && response.data) {
              console.log("Booking created successfully");
              this.successModal.message =
                "Booking created successfully:\n" +
                `User: ${response.data.user.email}.\n` +
                `Car: ${response.data.car.make} ${response.data.car.model}.\n` +
                `Issued Date: ${response.data.issuedDate}.\n` +
                `Returned Date: ${response.data.returnedDate}.\n`;
              this.successModal.show = true;
            } else {
              console.error("Response or response.data is undefined");
            }
          })
          .catch((error) => {
            console.log(error);
            this.errorMessage = error.response.data;
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
