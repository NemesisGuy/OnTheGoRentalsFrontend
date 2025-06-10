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
        <th @click="sortCars('uuid')">ID <i class="fas fa-sort"></i></th> <!-- Changed from 'id' to 'uuid' if that's the actual key -->
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
        <td v-if="!car.editing">{{ car.uuid ? car.uuid.substring(0,8) + '...' : 'N/A' }}</td>
        <td v-else>
          <input type="text" v-model="car.uuid" disabled class="form-control-inline">
        </td>
        <td v-if="!car.editing">{{ car.make }}</td>
        <td v-else>
          <input type="text" v-model="car.make" class="form-control-inline">
        </td>
        <td v-if="!car.editing">{{ car.model }}</td>
        <td v-else>
          <input type="text" v-model="car.model" class="form-control-inline">
        </td>
        <td v-if="!car.editing">{{ car.year }}</td>
        <td v-else>
          <input type="number" v-model.number="car.year" class="form-control-inline">
        </td>
        <td v-if="!car.editing">{{ car.category }}</td>
        <td v-else>
          <input type="text" v-model="car.category" class="form-control-inline">
        </td>
        <td v-if="!car.editing">{{ car.priceGroup }}</td>
        <td v-else>
          <input type="text" v-model="car.priceGroup" class="form-control-inline">
        </td>
        <td v-if="!car.editing">
          <input type="checkbox" v-model="car.available" disabled class="form-control-inline-check">
        </td>
        <td v-else>
          <input type="checkbox" v-model="car.available" class="form-control-inline-check">
        </td>
        <td class="actions-cell">
          <template v-if="!car.editing">
            <button @click="deleteCar(car.uuid)" class="delete-button button" title="Delete Car">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button @click="editCar(car)" class="update-button button" title="Edit Car"><i class="fas fa-edit"></i> Edit</button>
            <button @click="openCarView(car.uuid)" class="read-button button" title="View Car Details"><i class="fas fa-eye"></i> Read</button>
          </template>
          <template v-else>
            <button @click="saveCar(car)" class="update-button button" title="Save Changes"><i class="fas fa-save"></i> Save</button>
            <button @click="cancelEdit(car)" class="delete-button button" title="Cancel Edit"><i class="fas fa-times"></i> Cancel</button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <loading-modal v-if="loading" :show="true" message="Processing..."/> <!-- Simplified binding -->

    <confirmation-modal
        :show="showConfirmationModal"
        title="Confirm Car Deletion"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    >
      <template v-if="carToDelete">
        <div>
          <p>Are you sure you want to delete this Car?</p>
          <hr>
          <p><strong>UUID:</strong> {{ carToDelete.uuid ? carToDelete.uuid.substring(0,8) : 'N/A' }}...</p>
          <p><strong>Make:</strong> {{ carToDelete.make }}</p>
          <p><strong>Model:</strong> {{ carToDelete.model }}</p>
          <p><strong>Year:</strong> {{ carToDelete.year }}</p>
          <hr>
          <p class="text-danger"><b>Warning!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" @close="closeModal" :show="successModal.show"
                  :message="successModal.message"></SuccessModal>
    <FailureModal v-if="failModal.show" @close="closeModal" :show="failModal.show"
                  :message="failModal.message"></FailureModal>
  </div>
</template>

<script>
// import { jwtDecode } from "jwt-decode"; // Unused
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "../../Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

/**
 * @file CarManagment.vue
 * @description Admin component for managing car inventory. (Filename typo: "Managment")
 * Provides functionalities for viewing, searching, sorting, inline editing, creating (via navigation),
 * and deleting car entries. Uses modals for confirmations and feedback.
 * @component CarManagement
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "CarManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} cars - Stores all fetched car entries, each augmented with an `editing` flag.
   * @property {boolean} loading - Indicates if data is being fetched or an operation is in progress.
   * @property {string} sortBy - The key of the car property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc'). Used by enhanced sortedCars.
   * @property {string} searchQuery - Current search query for filtering cars.
   * @property {boolean} showConfirmationModal - Controls visibility of the delete confirmation modal.
   * @property {object|null} carToDelete - Stores the car object marked for deletion.
   * @property {object} successModal - Controls the success modal state.
   * @property {object} failModal - Controls the failure modal state.
   */
  data() {
    return {
      cars: [],
      loading: false,
      sortBy: "make", // Default sort key
      sortDirection: "asc", // Added for two-way sorting used by computed prop
      searchQuery: "",
      showConfirmationModal: false,
      carToDelete: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    /**
     * Returns a sorted version of the `cars` array based on `sortBy` and `sortDirection`.
     * Handles string, numeric, and boolean comparisons.
     * @returns {Array<object>} The sorted array of car entries.
     */
    sortedCars() {
      let sorted = [...this.cars]; // Work on a copy
      if (this.sortBy) {
        sorted.sort((a, b) => {
          let valA = a[this.sortBy];
          let valB = b[this.sortBy];

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            comparison = valA === valB ? 0 : valA ? -1 : 1; // true before false
          } else if (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !== 'string' && typeof valB !== 'string' ) {
            comparison = Number(valA) - Number(valB);
          } else {
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          }
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      return sorted;
    },
    /**
     * Filters the `sortedCars` array based on the `searchQuery`.
     * The search is case-insensitive and checks all stringified values of car properties.
     * @returns {Array<object>} Filtered list of car entries.
     */
    filteredCars() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) {
        return this.sortedCars;
      }
      return this.sortedCars.filter((car) => {
        return Object.values(car).some(value =>
            String(value).toLowerCase().includes(query)
        );
      });
    },
  },
  methods: {
    /**
     * Fetches the list of cars from the admin API endpoint.
     * Augments each car with an `editing: false` flag for UI state management.
     * Handles loading states and displays error/success feedback using modals.
     * @async
     * @returns {void}
     */
    fetchCars() {
      this.loading = true;
      console.debug("CarManagement: Fetching cars from API...");

      api.get("/api/v1/admin/cars")
          .then((response) => {
            if (response.status === 204 || !response.data || !response.data.data || response.data.data.length === 0) {
              this.cars = [];
              // this.showSuccessModal("No cars found or the list is empty."); // Avoid success modal for empty list
              console.info("CarManagement: No cars fetched or list is empty.");
            } else if (response.data.status === "success") {
              this.cars = response.data.data.map(car => ({...car, editing: false}));
              console.info(`CarManagement: Successfully fetched ${this.cars.length} cars.`);
            } else { // Handle non-success status in response body
              const errorMsg = response.data.errors?.map(e => e.message).join(", ") || "Failed to fetch cars due to API error.";
              throw new Error(errorMsg); // Propagate to catch block
            }
          })
          .catch((error) => {
            let errorMessage = "Failed to fetch cars. Please try again.";
            if (error.response?.data) {
              if (error.response.data.errors?.length > 0) {
                errorMessage = error.response.data.errors.map(e => e.message || e).join(", ");
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              }
            } else if (error.message && !error.message.includes('Network Error') && !error.message.includes('Request failed')) {
              errorMessage = error.message;
            }
            this.showFailureModal(errorMessage);
            console.error("CarManagement: Error fetching cars:", error.response || error.message || error);
            this.cars = []; // Clear cars on error
            if (error.response?.status === 401 || error.response?.status === 403) {
              // Optional: this.$router.push("/login");
            }
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Closes any active success, failure, or confirmation modals.
     * @returns {void}
     */
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },
    /**
     * Initiates the car deletion process. Sets `carToDelete` and shows the confirmation modal.
     * @param {string} carUuid - The UUID of the car to be deleted.
     * @returns {void}
     */
    deleteCar(carUuid) {
      const car = this.cars.find((c) => c.uuid === carUuid);
      if (car) {
        this.carToDelete = car;
        this.showConfirmationModal = true;
        console.info(`CarManagement: Deletion requested for car UUID: ${carUuid}`);
      } else {
        console.warn(`CarManagement: Attempted to delete non-existent car UUID: ${carUuid}`);
        this.showFailureModal("Car not found for deletion.");
      }
    },
    /**
     * Cancels the car deletion process, hides the confirmation modal, and resets `carToDelete`.
     * @returns {void}
     */
    cancelDelete() {
      this.showConfirmationModal = false;
      this.carToDelete = null;
      console.debug("CarManagement: Car deletion cancelled.");
    },
    /**
     * Confirms and executes the car deletion via an API call.
     * Refreshes the car list on success or shows a failure modal on error.
     * Manages loading state during the operation.
     * @async
     * @returns {void}
     */
    confirmDelete() {
      if (this.carToDelete?.uuid) {
        this.loading = true; // Use global loading or a specific one like `isDeleting`
        console.info(`CarManagement: Confirming deletion for car UUID: ${this.carToDelete.uuid}`);
        api.delete(`/api/v1/admin/cars/${this.carToDelete.uuid}`)
            .then((response) => {
              if (response.status === 204 || response.status === 200) { // 204 No Content is typical for successful DELETE
                console.info(`CarManagement: Car UUID: ${this.carToDelete.uuid} deleted successfully.`);
                this.showSuccessModal(`Car (UUID: ${this.carToDelete.uuid.substring(0,8)}...) deleted successfully!`);
                this.fetchCars(); // Refresh list
              } else { // Should ideally be caught by .catch for non-2xx statuses
                const errorMsg = response.data?.errors?.map(e => e.message).join(", ") || `Delete responded with status ${response.status}`;
                throw new Error(errorMsg);
              }
            })
            .catch((error) => {
              let errorMessage = "Failed to delete car.";
              if (error.response?.data) {
                if (error.response.data.errors?.length > 0) {
                  errorMessage = error.response.data.errors.map(e => e.message || e).join(", ");
                } else if (error.response.data.message) {
                  errorMessage = error.response.data.message;
                }
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.showFailureModal(errorMessage);
              console.error(`CarManagement: Error deleting car UUID ${this.carToDelete?.uuid}:`, error.response || error.message || error);
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false; // Ensure modal is hidden
              this.carToDelete = null; // Reset
            });
      } else {
        console.error("CarManagement: confirmDelete called without a carToDelete or carToDelete.uuid.");
        this.showFailureModal("No car selected for deletion or car UUID is missing.");
        this.showConfirmationModal = false;
      }
    },
    /**
     * Navigates to the detailed view page for a specific car.
     * @param {string} uuid - The UUID of the car to view.
     * @returns {void}
     */
    openCarView(uuid) {
      console.debug(`CarManagement: Navigating to view car with UUID: ${uuid}`);
      this.$router.push({ name: 'ViewCar', params: { uuid: uuid } }); // Ensure 'AdminViewCar' or similar route name
    },
    /**
     * Sets the key and direction by which to sort the car list.
     * Toggles direction if the same key is clicked again.
     * @param {string} sortByProperty - The property name of the car object to sort by.
     * @returns {void}
     */
    sortCars(sortByProperty) { // Renamed param for clarity
      if (this.sortBy === sortByProperty) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = sortByProperty;
        this.sortDirection = 'asc';
      }
      console.debug(`CarManagement: Sorting cars by: ${this.sortBy}, direction: ${this.sortDirection}`);
      // `filteredCars` (which uses `sortedCars`) will re-evaluate due to `sortBy` or `sortDirection` change.
    },
    /**
     * Resets the search query, clearing any active filters and re-displaying sorted full list.
     * @returns {void}
     */
    resetSearch() {
      this.searchQuery = "";
      console.debug("CarManagement: Search query reset.");
      // `filteredCars` will re-evaluate.
    },
    /**
     * Enables inline editing mode for a specific car in the list.
     * (Note: For complex edits or to enable true cancel, a deep copy of the car object
     * or its editable fields should be made here and stored, then restored in `cancelEdit`.)
     * @param {object} car - The car object to be edited.
     * @returns {void}
     */
    editCar(car) {
      // car.originalData = { ...car }; // Example of storing original for revert, if needed
      car.editing = true;
      console.debug(`CarManagement: Editing mode enabled for car UUID: ${car.uuid}`);
    },
    /**
     * Saves the changes made to an inline-edited car by making a PUT API call.
     * Disables editing mode on successful save. Shows success/failure modals.
     * @param {object} car - The car object containing updated data (directly modified by v-model).
     * @async
     * @returns {void}
     */
    saveCar(car) {
      this.loading = true;
      console.info(`CarManagement: Attempting to save updates for car UUID: ${car.uuid}`);
      // The 'car' object from the list has been directly modified by v-models.
      // We might need to strip the 'editing' flag or other UI-specific properties before sending.
      const payload = { ...car };
      delete payload.editing; // Remove UI flag from payload
      // delete payload.originalData; // If you implemented originalData storage

      api.put(`/api/v1/admin/cars/${car.uuid}`, payload)
          .then((response) => {
            if (response.data?.status === "success" && response.data?.data) {
              Object.assign(car, response.data.data); // Update local data with response
              car.editing = false; // Turn off editing mode
              this.showSuccessModal(`Car (UUID: ${car.uuid.substring(0,8)}...) updated successfully.`);
              console.info(`CarManagement: Car UUID: ${car.uuid} updated successfully.`);
              // this.fetchCars(); // Optionally re-fetch full list for ultimate consistency
            } else {
              const errorMsg = response.data?.errors?.map(e => e.message).join(", ") || "Update successful but server response format was unexpected.";
              throw new Error(errorMsg);
            }
          })
          .catch((error) => {
            let errorMessage = "Failed to update car details.";
             if (error.response?.data) {
              if (error.response.data.errors?.length > 0) {
                errorMessage = error.response.data.errors.map(e => e.message || e).join(", ");
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.showFailureModal(errorMessage);
            console.error(`CarManagement: Error updating car UUID ${car.uuid}:`, error.response || error.message || error);
            // car.editing = true; // Keep editing mode on if save failed and you want user to retry/correct
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Cancels inline editing mode for a car.
     * (Note: Currently, this only sets the `editing` flag to false.
     * To truly revert changes, the component would need to restore the car's data
     * from a copy made when `editCar` was called.)
     * @param {object} car - The car object for which editing is being cancelled.
     * @returns {void}
     */
    cancelEdit(car) {
      car.editing = false;
      console.debug(`CarManagement: Editing cancelled for car UUID: ${car.uuid}`);
      // If original data was stored:
      // if (car.originalData) {
      //   Object.assign(car, car.originalData);
      //   delete car.originalData;
      // } else { // Fallback if original data wasn't stored, re-fetch might be an option
      //    this.fetchCars(); // This will revert all potential inline edits on all rows
      // }
    },
    /** Displays a success modal with a given message. */
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    /** Displays a failure modal with a given message. */
    showFailureModal(message) { this.failModal = { show: true, message }; },
    /** Navigates back in router history. */
    goBack() { this.$router.go(-1); },
  },
  /**
   * Lifecycle hook called when the component is created.
   * Initiates fetching of the initial car list.
   */
  created() {
    console.debug("CarManagement component created. Fetching initial car list.");
    this.fetchCars();
  },
};
</script>

<style scoped>
/* Your component-specific styles here */
</style>