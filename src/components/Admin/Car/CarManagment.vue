<template>
  <div class="content-container">

    <div class="content-header">
      <h1><i class="fas fa-car"> </i>
        Car Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-search"> </i> Reset
            </button>
          </div>
          <router-link to="/admin/cars/create" class="add-button button">
            <i class="fas fa-car"> </i> Add Car
          </router-link>
        </div>
      </div>

    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortCars('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortCars('make')">Make <i class="fas fa-sort"></i></th>
        <th @click="sortCars('model')">Model <i class="fas fa-sort"></i></th>
        <th @click="sortCars('year')">Year <i class="fas fa-sort"></i></th>
        <th @click="sortCars('category')">Category <i class="fas fa-sort"></i></th>
        <th @click="sortCars('priceGroup')">Price Group <i class="fas fa-sort"></i></th>
        <th @click="sortCars('available')">Available <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="car in filteredCars" :key="car.uuid">
        <td v-if="!car.editing">{{ car.uuid }}</td>
        <td v-else>
          <input type="text" v-model="car.uuid" disabled>
        </td>
        <td v-if="!car.editing">{{ car.make }}</td>
        <td v-else>
          <input type="text" v-model="car.make">
        </td>
        <td v-if="!car.editing">{{ car.model }}</td>
        <td v-else>
          <input type="text" v-model="car.model">
        </td>
        <td v-if="!car.editing">{{ car.year }}</td>
        <td v-else>
          <input type="text" v-model="car.year">
        </td>
        <td v-if="!car.editing">{{ car.category }}</td>
        <td v-else>
          <input type="text" v-model="car.category">
        </td>
        <td v-if="!car.editing">{{ car.priceGroup }}</td>
        <td v-else>
          <input type="text" v-model="car.priceGroup">
        </td>
        <td v-if="!car.editing">
          <input type="checkbox" v-model="car.available" :disabled="car.editing">
        </td>
        <td v-else>
          <input type="checkbox" v-model="car.available">
        </td>
        <td>
          <template v-if="!car.editing">
            <button @click="deleteCar(car.uuid)" class="delete-button button">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button @click="editCar(car)" class="update-button button"><i class="fas fa-edit"></i> Edit</button>
            <button @click="openCarView(car.uuid)" class="read-button button"><i class="fas fa-eye"></i> Read</button>
          </template>
          <template v-else>
            <button @click="saveCar(car)" class="update-button button">Save</button>
            <button @click="cancelEdit(car)" class="delete-button button">Cancel</button>
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
      <template v-if="carToDelete">
        <div>
          <p>Are you sure you want to delete this Car?</p>
          <hr>
          <p>ID: {{ carToDelete.uuid }}</p>
          <p>Make: {{ carToDelete.make }}</p>
          <p>Model: {{ carToDelete.model }}</p>
          <p>Year: {{ carToDelete.year }}</p>
          <p>Category: {{ carToDelete.category }}</p>
          <p>Price Group: {{ carToDelete.priceGroup }}</p>
          <p>License Plate: {{ carToDelete.licensePlate }}</p>
          <p>Available: {{ carToDelete.available }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" @close="closeModal" @cancel="closeModal" :show="successModal.show"
                  :message="successModal.message"></SuccessModal>
    <FailureModal v-if="failModal.show" @close="closeModal" @cancel="closeModal" :show="failModal.show"
                  :message="failModal.message"></FailureModal>


  </div>
</template>


<script>

import { jwtDecode } from "jwt-decode";
// import axios from "axios"; // Axios is likely configured and imported via @/api
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "../../Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api"; // Your pre-configured Axios instance

// Axios request interceptor (if not already globally configured in api.js)
// This is good to have, but if api.js already does this, it might be redundant here.
// For safety, ensure it's configured once.
/*
axios.interceptors.request.use( // Better to configure this in your main api.js or a boot file
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
*/

let log =  console; // Use Vue's logger if available, otherwise fallback to console
export default {
  name: "CarManagement", // Assuming this is for car management
  data() {
    return {
      cars: [], // Holds the list of cars fetched from the API
      loading: false, // Controls the visibility of the loading indicator/modal
      sortBy: "", // Key to sort the cars by
      searchQuery: "", // Current search query input by the user
      showConfirmationModal: false, // Toggles the delete confirmation modal
      carToDelete: null, // Stores the car object marked for deletion
      successModal: {
        show: false,
        message: "",
      }, // Controls the success feedback modal
      failModal: {
        show: false,
        message: "",
      }, // Controls the failure feedback modal
      // originalCars: [], // Could be useful for cancelling edits, not currently implemented in save/cancel
    };
  },
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  computed: {
    /**
     * Sorts the cars based on the current 'sortBy' key.
     * @returns {Array} A new array of sorted cars.
     */
    sortedCars() {
      if (this.sortBy) {
        const sorted = [...this.cars]; // Create a new array to avoid mutating original
        // A more robust sort might handle different data types better
        sorted.sort((a, b) => {
          const valA = a[this.sortBy] === null || a[this.sortBy] === undefined ? "" : String(a[this.sortBy]).toLowerCase();
          const valB = b[this.sortBy] === null || b[this.sortBy] === undefined ? "" : String(b[this.sortBy]).toLowerCase();
          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        });
        return sorted;
      }
      return this.cars;
    },
    /**
     * Filters the sorted cars based on the 'searchQuery'.
     * Checks all string properties of each car.
     * @returns {Array} Filtered list of cars.
     */
    filteredCars() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) {
        return this.sortedCars; // Return sorted if no query
      }
      return this.sortedCars.filter((car) => {
        // Iterate over car properties
        return Object.values(car).some(value =>
            String(value).toLowerCase().includes(query)
        );
      });
    },
  },
  methods: {
    /**
     * Fetches the list of cars from the admin API endpoint.
     * Updates the 'cars' data property and handles loading states and errors.
     */
    fetchCars() {
      this.loading = true;
      let log =  console; // Use Vue's logger if available, otherwise fallback to console
      log.debug("Fetching cars from API...");

      api
          .get("/api/v1/admin/cars") // 'api' instance has baseURL and auth interceptor configured
          .then((response) => {
            if (response.status === 204 || !response.data || !response.data.data || response.data.data.length === 0) {
              this.cars = [];
              this.showSuccessModal("No cars found or the list is empty.");
              log.info("No cars fetched or list is empty.");
            } else if (response.data.status === "success") {
              this.cars = response.data.data.map(car => ({...car, editing: false})); // Add editing flag
              log.info(`Successfully fetched ${this.cars.length} cars.`);
            } else {
              const errorMsg = response.data.errors?.map(e => e.message).join(", ") || "Failed to fetch cars due to API error.";
              throw new Error(errorMsg);
            }
          })
          .catch((error) => {
            let errorMessage = "Failed to fetch cars. Please try again.";
            if (error.response && error.response.data) {
              if (error.response.data.errors && error.response.data.errors.length > 0) {
                errorMessage = error.response.data.errors.map(e => e.message || e).join(", ");
              } else if (error.response.data.message) { // For non-ApiResponse errors
                errorMessage = error.response.data.message;
              }
            } else if (error.message && !error.message.includes('Network Error') && !error.message.includes('Request failed')) {
              // Use error.message if it's not a generic network error
              errorMessage = error.message;
            }
            this.showFailureModal(errorMessage);
            console.error("Error fetching cars:", error.response || error);
            if (error.response?.status === 401 || error.response?.status === 403) {
              // this.$router.push("/login"); // Or your unauthorized page
            }
          })
          .finally(() => {
            this.loading = false;
          });
    },

    /**
     * Closes any active success, failure, or confirmation modals.
     */
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false; // Ensure confirmation modal is also closed
    },

    /**
     * Initiates the car deletion process by showing a confirmation modal.
     * @param {string} carUuid - The UUID of the car to be deleted.
     */
    deleteCar(carUuid) {
      const car = this.cars.find((c) => c.uuid === carUuid);
      if (car) {
        this.carToDelete = car; // Store the whole car object
        this.showConfirmationModal = true;
        log.info(`Deletion requested for car UUID: ${carUuid}`);
      } else {
        log.warn(`Attempted to delete non-existent car UUID: ${carUuid}`);
        this.showFailureModal("Car not found for deletion.");
      }
    },

    /**
     * Cancels the car deletion process and hides the confirmation modal.
     */
    cancelDelete() {
      this.showConfirmationModal = false;
      this.carToDelete = null;
      log.debug("Car deletion cancelled.");
    },

    /**
     * Confirms and executes the car deletion via an API call.
     * Refreshes the car list on success or shows a failure modal on error.
     */
    confirmDelete() {
      if (this.carToDelete && this.carToDelete.uuid) {
        this.loading = true;
        log.info(`Confirming deletion for car UUID: ${this.carToDelete.uuid}`);
        api
            .delete(`/api/v1/admin/cars/${this.carToDelete.uuid}`) // CORRECTED URL
            .then((response) => {
              // For DELETE with 204 No Content, response.data will be undefined/null.
              // Success is indicated by the HTTP status code.
              if (response.status === 204 || response.status === 200) {
                log.info(`Car UUID: ${this.carToDelete.uuid} deleted successfully from backend.`);
                this.showSuccessModal(`Car (UUID: ${this.carToDelete.uuid}) was deleted successfully!`);
                this.fetchCars(); // Refresh the list from the server
              } else {
                // Handle unexpected success status with a body if API changes
                const errorMsg = response.data?.errors?.map(e => e.message).join(", ") || `Delete responded with status ${response.status}`;
                throw new Error(errorMsg);
              }
            })
            .catch((error) => {
              let errorMessage = "Failed to delete car.";
              if (error.response && error.response.data) {
                if (error.response.data.errors && error.response.data.errors.length > 0) {
                  errorMessage = error.response.data.errors.map(e => e.message || e).join(", ");
                } else if (error.response.data.message) { // For non-ApiResponse errors from backend
                  errorMessage = error.response.data.message;
                }
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.showFailureModal(errorMessage);
              console.error(`Error deleting car UUID ${this.carToDelete?.uuid}:`, error.response || error);
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false;
              this.carToDelete = null;
            });
      } else {
        log.error("confirmDelete called without a carToDelete or carToDelete.uuid being set.");
        this.showFailureModal("No car selected for deletion or car UUID is missing.");
        this.showConfirmationModal = false; // Hide modal if something went wrong
      }
    },

    /**
     * Navigates to the detailed view page for a specific car.
     * @param {string} uuid - The UUID of the car to view.
     */
    openCarView(uuid) {
      log.debug(`Navigating to view car with UUID: ${uuid}`);
      this.$router.push({ name: 'ViewCar', params: { uuid: uuid } });
    },

    /**
     * Sets the key by which to sort the car list.
     * @param {string} sortBy - The property name of the car object to sort by.
     */
    sortCars(sortBy) {
      this.sortBy = sortBy;
      log.debug(`Sorting cars by: ${sortBy}`);
    },

    /**
     * Resets the search query, clearing any active filters.
     */
    resetSearch() {
      this.searchQuery = "";
      log.debug("Search query reset.");
    },

    /**
     * Enables editing mode for a specific car in the list.
     * @param {object} car - The car object to be edited.
     */
    editCar(car) {
      // It's good practice to work on a copy if edits are complex or can be cancelled
      // For inline editing, directly setting a flag is common.
      // To enable cancelling edits, store original state:
      // this.originalCarData = { ...car }; // Store before setting editing to true
      car.editing = true;
      log.debug(`Editing mode enabled for car UUID: ${car.uuid}`);
    },

    /**
     * Saves the changes made to a car by calling the update API.
     * Disables editing mode on success.
     * @param {object} car - The car object containing updated data.
     */
    saveCar(car) {
      this.loading = true; // Set loading true at the start of the save operation
      log.info(`Attempting to save updates for car UUID: ${car.uuid}`);
      // The 'car' object here is the one from the list, with its properties directly modified by v-model
      // No need to reconstruct payload if 'car' already has all necessary fields for PUT
      api
          .put(`/api/v1/admin/cars/${car.uuid}`, car) // 'car' object should contain the updated fields
          .then((response) => {
            // Assuming successful PUT returns 200 OK with the updated car data (wrapped in ApiResponse)
            if (response.data && response.data.status === "success" && response.data.data) {
              // Update the local car object with the response data to ensure consistency
              // especially if the backend made further modifications or returned fresh data.
              Object.assign(car, response.data.data); // Update local data with response
              car.editing = false;
              this.showSuccessModal(`Car (UUID: ${car.uuid}) was updated successfully.`);
              log.info(`Car UUID: ${car.uuid} updated successfully.`);
              // Optional: call this.fetchCars() if PUT response doesn't return full updated list or for ultimate consistency
              // However, Object.assign usually suffices if the response contains the complete updated entity.
            } else {
              const errorMsg = response.data?.errors?.map(e => e.message).join(", ") || "Update successful but response format unexpected.";
              throw new Error(errorMsg); // Let catch block handle it
            }
          })
          .catch((error) => {
            let errorMessage = "Failed to update car.";
            if (error.response && error.response.data) {
              if (error.response.data.errors && error.response.data.errors.length > 0) {
                errorMessage = error.response.data.errors.map(e => e.message || e).join(", ");
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.showFailureModal(errorMessage);
            console.error(`Error updating car UUID ${car.uuid}:`, error.response || error);
            // Optionally, revert changes if edit had a cancel mechanism with original data
            // car.editing = true; // Keep editing mode on if save failed
          })
          .finally(() => {
            this.loading = false;
          });
    },
    // pushUpdatedCar method seems to be an older version of saveCar.
    // I've integrated its logic into saveCar. Removing pushUpdatedCar to avoid duplication.

    /**
     * Cancels editing mode for a car.
     * Reverts changes if original data was stored (not implemented in this version).
     * @param {object} car - The car object for which editing is being cancelled.
     */
    cancelEdit(car) {
      car.editing = false;
      log.debug(`Editing cancelled for car UUID: ${car.uuid}`);
      // If you stored original data:
      // Object.assign(car, this.originalCarData);
      // this.originalCarData = null;
      // For now, it just turns off the editing flag. If fields were bound with v-model,
      // changes made before cancel will persist unless reverted.
      // To truly revert, you'd need to fetchCars() or restore from a deep copy.
      // This often requires a more complex edit state management.
    },

    /**
     * Closes either the success or failure modal.
     * This method is redundant as closeModal() already does this.
     * Kept for compatibility if used by templates, but recommend using closeModal().
     * @deprecated Use closeModal() instead.
     */
    closeSuccessFailModal() {
      log.warn("closeSuccessFailModal() is deprecated. Use closeModal() instead.");
      this.closeModal();
    },
    /**
     * Displays a success modal with a given message.
     * @param {string} message - The success message to display.
     */
    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },
    /**
     * Displays a failure modal with the provided message.
     * @param {string} message - The message to display in the failure modal.
     */
    showFailureModal(message) {
      this.failModal = { show: true, message };
    },
    /**
     * Navigates back to the previous page in the router history.
     */
    goBack() {
      this.$router.go(-1);
    },
  },
  /**
   * Lifecycle hook called when the component is created.
   * Initiates fetching of cars.
   */
  created() {
    log.debug("CarManagement component created. Fetching initial car list.");
    this.fetchCars();
  },
};
</script>

<style scoped>
/* Your component-specific styles here */
</style>