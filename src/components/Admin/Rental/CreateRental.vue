<template xmlns="http://www.w3.org/1999/html">
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>

      <form ref="rentalForm" @submit.prevent="createRental">
        <div class="form-header">
          <h2>Create Rental</h2>
        </div>
        <div class="form-group">
          <label for="user">User:</label>
          <select id="user" v-model="selectedUser" name="userId">
            <option v-for="user in users" :key="user.id" :value="user.id">
              User ID: {{ user.id }}, User: {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="issuer">Issuer:</label>
          <select id="issuer" v-model="selectedIssuer" name="issuer">
            <option v-for="user in users" :key="user.id" :value="user.id">
              User ID: {{ user.id }}, User: {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="receiver">Receiver:</label>
          <select id="receiver" v-model="selectedReceiver" name="receiver">
            <option v-for="user in users" :key="user.id" :value="user.id">
              User ID: {{ user.id }}, User: {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
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
          <label for="fine">Fine:</label>
          <input id="fine" v-model="fine" name="fine" type="text">
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
import api from "@/api";
// Define your headers
// Add this line to set a default base URL for your API
// axios.defaults.baseURL = 'http://localhost:8080';

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
      const token = localStorage.getItem('token');
      api
          .get('/api/admin/users/list/all'
              , {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
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
      const token = localStorage.getItem('token');
      api
          .get('/api/admin/cars/all', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
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
      // Convert the fine to an integer with no decimal
      const fine = Math.floor(this.fine); // Remove decimal from fine

      // Create a new rental object
      const rental = {
        user: {
          id: null,
          firstName: null,
          lastName: null,
          email: null,
          enabled: null,
          roles: null
        },
        car: {
          id: this.selectedCar
        },
        issuer: this.selectedIssuer,
        receiver: this.selectedReceiver,
        fine: fine,
        issuedDate: this.selectedIssuedDate,
        returnedDate: this.selectedReturnedDate,
      };

      // Fetch user details
      const token = localStorage.getItem('token');
      api
          .get(`/api/admin/users/read/${this.selectedUser}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            const userData = response.data;
            rental.user.id = userData.id;
            rental.user.firstName = userData.firstName;
            rental.user.lastName = userData.lastName;
            rental.user.email = userData.email;
            rental.user.enabled = userData.enabled;
            rental.user.roles = userData.roles; // Include user roles
            console.log("User Details filtered from response: ");
            console.log(rental.user);

            // Fetch car details
            api
                .get(`/api/admin/cars/read/${this.selectedCar}`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                })
                .then(response => {
                  rental.car = response.data;

                  // Show the confirmation modal
                  this.showConfirmationModal = true;

                  // Store the confirm and cancel functions to be called later
                  this.confirm = () => {
                    this.loadingModal.show = true;
                    this.showConfirmationModal = false;

                    // Make the POST request to create the rental
                  /*  console.log(rental.userObject);*/
                    api
                        .post('/api/admin/rentals/create', rental, {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        })
                        .then(response => {
                          console.log('Rental created successfully');
                          this.loadingModal.show = false;

                          this.successModal.message = "Rental created successfully: " + "\n" +
                              "User: " + response.data.user.firstName + " " + response.data.user.lastName + "." + "\n" +
                              "Car: " + response.data.car.make + " " + response.data.car.model + "." + "\n" +
                              +"Issuer: " + response.data.issuer + "." + "\n" +
                              +"Receiver: " + response.data.receiver + "." + "\n" +
                              +"Fine: " + response.data.fine + "." + "\n" +
                              +"Issued Date: " + response.data.issuedDate + "." + "\n" +
                              +"Returned Date: " + response.data.returnedDate + "." + "\n";
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
