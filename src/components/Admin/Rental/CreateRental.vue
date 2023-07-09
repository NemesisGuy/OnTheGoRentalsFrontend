<template>
  <div class="create-rental">
    <LoadingModal :show="loadingModal.show" v-if="loadingModal.show"></LoadingModal>

    <form ref="rentalForm" @submit.prevent="createRental">
      <div class="form-header">
        <h2>Create Rental</h2>
      </div>
      <div class="form-group">
        <label for="user">User:</label>
        <select v-model="selectedUser" id="user" name="userId">
          <option v-for="user in users" :key="user.id" :value="user.id">
            User ID: {{ user.id }} UserName: {{ user.userName }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="issuer">Issuer:</label>
        <select v-model="selectedIssuer" id="issuer" name="issuer">
          <option v-for="user in users" :key="user.id" :value="user.id">
            User ID: {{ user.id }} UserName: {{ user.userName }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="receiver">Receiver:</label>
        <select v-model="selectedReceiver" id="receiver" name="receiver">
          <option v-for="user in users" :key="user.id" :value="user.id">
            User ID: {{ user.id }} UserName: {{ user.userName }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="car">Car:</label>
        <select v-model="selectedCar" id="car" name="carId">
          <option v-for="car in cars" :key="car.id" :value="car.id">
            Car ID: {{ car.id }} Make: {{ car.make }} Model: {{ car.model }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="fine">Fine:</label>
        <input v-model="fine" type="text" id="fine" name="fine">
      </div>

      <div class="form-group">
        <label for="issuedDate">Issued Date:</label>
        <input v-model="selectedIssuedDate" type="datetime-local" id="issuedDate" name="issuedDate">
      </div>

      <div class="form-group">
        <label for="returnedDate">Returned Date:</label>
        <input v-model="selectedReturnedDate" type="datetime-local" id="returnedDate" name="returnedDate">
      </div>

      <div class="form-group">
        <button type="submit">Create Rental</button>
      </div>
    </form>
  </div>
  <div class="modal-body">

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- Add the LoadingModal component -->


    <!-- Add the ConfirmationModal component -->
    <confirmation-modal
        key="confirmationModal"
        :show="showConfirmationModal"
        @confirm="confirm"
        @cancel="cancel"
    >
      <template v-if="showConfirmationModal">
        <div>
          <h3>Confirmation</h3>
          <p>Are you sure you want to create this Rental?</p>
          <hr>
          <p>User ID: {{ selectedUser }}</p>
          <p>Issuer ID: {{ selectedIssuer }}</p>
          <p>Receiver ID: {{ selectedReceiver }}</p>
          <p>Car ID: {{ selectedCar }}</p>
          <p>Fine: {{ fine }}</p>
          <p>Issued Date: {{ selectedIssuedDate }}</p>
          <p>Returned Date: {{ selectedReturnedDate }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>

        </div>
      </template>

    </confirmation-modal>

    <!-- Add the SuccessModal component -->
    <SuccessModal
        key="successModal"
        v-if="successModal.show"
        @close="closeModal"
        @cancel="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
        :show="successModal.show"
        :message="successModal.message"
    ></SuccessModal>

    <!-- Add the FailureModal component -->
    <FailureModal
        key="failModal"
        v-if="failModal.show"
        @close="closeModal"
        @cancel="closeModal"
        :show="failModal.show"
        :message="failModal.message"
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
      selectedUser: '',
      selectedCar: '',
      selectedIssuer: '',
      selectedReceiver: '',
      fine: '',
      selectedIssuedDate: '',
      selectedReturnedDate: '',
      confirm: null,
      cancel: null,
      loadingModal: {
        show: false,
      },
      errorMessage: '',
      showConfirmationModal: false,
      successModal: {
        show: false,
        message: ""
      },
      failModal: {
        show: false,
        message: ""
      }
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
          .get('http://localhost:8080/api/admin/users/list/all')
          .then(response => {
            this.users = response.data;
            this.loadingModal.show = false;
          })
          .catch(error => {
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
          .get('http://localhost:8080/api/admin/cars/all')
          .then(response => {
            this.cars = response.data;
            this.loadingModal.show = false;
          })
          .catch(error => {
            console.log(error);
            this.failModal.message = "Failed to fetch cars list";
            this.failModal.show = true;
            this.loadingModal.show = false;
          }).finally(() => {
        this.loadingModal.show = false;
      });
    },
    createRental() {
      this.loadingModal.show = true;
      // Reset error message
      this.errorMessage = '';

      // Create a new rental object
      const rental = {
        user: {},
        car: {},
        issuer: this.selectedIssuer,
        receiver: this.selectedReceiver,
        fine: this.fine,
        issuedDate: this.selectedIssuedDate,
        returnedDate: this.selectedReturnedDate,
      };

      // Fetch user details
      axios
          .get(`http://localhost:8080/api/admin/users/read/${this.selectedUser}`)
          .then(response => {
            rental.user = response.data;
            // Fetch car details
            axios
                .get(`http://localhost:8080/api/admin/cars/read/${this.selectedCar}`)
                .then(response => {
                  rental.car = response.data;

                  // Show the confirmation modal
                  this.showConfirmationModal = true;

                  // Store the confirm and cancel functions to be called later
                  this.confirm = () => {
                    this.loadingModal.show = true;
                    this.showConfirmationModal = false;

                    // Make the POST request to create the rental
                    axios
                        .post('http://localhost:8080/api/admin/rentals/create', rental)
                        .then(response => {
                          console.log('Rental created successfully');
                          this.loadingModal.show = false;
                          //lets put each item on a new line
                          this.successModal.message = "Rental created successfully: " + "\n" +
                              "User: " + response.data.user.firstName + " " + response.data.user.lastName + "." + "\n" +
                              "Car: " + response.data.car.make + " " + response.data.car.model + "." + "\n" +
                              + "Issuer: " + response.data.issuer + "." + "\n" +
                              + "Receiver: " + response.data.receiver + "." + "\n" +
                              + "Fine: " + response.data.fine + "." + "\n" +
                              + "Issued Date: " + response.data.issuedDate + "." + "\n" +
                              + "Returned Date: " + response.data.returnedDate + "." + "\n";
                          this.successModal.show = true;

                          // Reset the form after creating the rental
                          this.resetForm();
                        })
                        .catch(error => {
                          console.log(error);
                          if (error.response && error.response.status === 400) {
                            this.errorMessage = error.response.data;
                            console.log(error.response.data);
                            console.log(error.response.status);
                            this.failModal.message = "Invalid data. Please check the entered values.";
                            this.failModal.message = error.response.data;
                            this.failModal.show = true;
                          } else {
                            this.errorMessage = 'An error occurred while creating the rental.';
                            this.failModal.message = error.response.data;
                            this.failModal.show = true;
                          }
                          this.loadingModal.show = false;
                        });
                  };

                  this.cancel = () => {
                    this.loadingModal.show = false;
                    this.showConfirmationModal = false;
                  };

                  this.loadingModal.show = false;
                })
                .catch(error => {
                  console.log(error);
                  this.errorMessage = 'Error fetching car details.';
                  this.failModal.message = error.response.data;
                  this.failModal.show = true;
                  this.loadingModal.show = false;
                });
          })
          .catch(error => {
            console.log(error);
            this.errorMessage = 'Error fetching user details.';
            this.failModal.message = error.response.data;
            this.failModal.show = true;
            this.loadingModal.show = false;
          });
    },

    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },


    resetForm() {
      this.loadingModal.show = true;
      this.selectedUser = '';
      this.selectedCar = '';
      this.selectedIssuer = '';
      this.selectedReceiver = '';
      this.fine = '';
      this.selectedIssuedDate = '';
      this.selectedReturnedDate = '';
      this.$nextTick(() => {
        this.loadingModal.show = false;
      });
    },
  },
};
</script>



<style>

</style>
