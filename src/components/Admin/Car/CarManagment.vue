<template>
  <div class="content-container">

    <div class="content-header">
      <h1><i class="fas fa-car"></i> Car Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search by make, model, year..." type="text"/>
            <button @click="resetSearch" class="read-button button">
              <i class="fas fa-sync-alt"></i> Reset
            </button>
          </div>
          <router-link to="/admin/cars/create" class="add-button button">
            <i class="fas fa-plus"></i> Add Car
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingModal v-if="loading" show message="Fetching cars..."/>

    <!-- Table Display -->
    <table v-if="!loading && cars.length > 0">
      <thead>
      <tr>
        <th @click="sortCars('make')">Make <i class="fas fa-sort"></i></th>
        <th @click="sortCars('model')">Model <i class="fas fa-sort"></i></th>
        <th @click="sortCars('year')">Year <i class="fas fa-sort"></i></th>
        <th @click="sortCars('priceGroup')">Price Group <i class="fas fa-sort"></i></th>
        <th @click="sortCars('available')">Available <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="car in filteredCars" :key="car.uuid">
        <td>{{ car.make }}</td>
        <td>{{ car.model }}</td>
        <td>{{ car.year }}</td>
        <td>{{ car.priceGroup }}</td>
        <td>
          <i :class="car.available ? 'fas fa-check-circle status-available' : 'fas fa-times-circle status-unavailable'"></i>
        </td>
        <td class="actions-buttons">
          <button @click="openCarView(car.uuid)" class="read-button button" title="View Details"><i class="fas fa-eye"></i></button>
          <button @click="navigateToEdit(car.uuid)" class="update-button button" title="Edit Car"><i class="fas fa-edit"></i></button>
          <button @click="deleteCar(car)" class="delete-button button" title="Delete Car"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- No Cars Found State -->
    <div v-if="!loading && cars.length === 0" class="no-data-container">
      <p>No cars found. <router-link to="/admin/cars/create">Add a new car</router-link> to get started.</p>
    </div>

    <!-- Modals for actions -->
    <ConfirmationModal
        :show="showConfirmationModal"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    >
      <template v-if="carToDelete">
        <div>
          <p>Are you sure you want to delete this Car?</p>
          <hr>
          <p><strong>Make:</strong> {{ carToDelete.make }}</p>
          <p><strong>Model:</strong> {{ carToDelete.model }}</p>
          <p><strong>UUID:</strong> {{ carToDelete.uuid }}</p>
          <hr>
          <p><b>Warning!</b> This action cannot be undone.</p>
        </div>
      </template>
    </ConfirmationModal>
    <SuccessModal v-if="successModal.show" @close="closeModal" :show="successModal.show" :message="successModal.message"></SuccessModal>
    <FailureModal v-if="failModal.show" @close="closeModal" :show="failModal.show" :message="failModal.message"></FailureModal>
  </div>
</template>

<script>
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "../../Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "CarManagement",
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      cars: [],
      loading: false,
      sortBy: "make",
      searchQuery: "",
      showConfirmationModal: false,
      carToDelete: null,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    sortedCars() {
      // Logic for sorting remains the same
      if (this.sortBy) {
        return [...this.cars].sort((a, b) => String(a[this.sortBy]).localeCompare(String(b[this.sortBy])));
      }
      return this.cars;
    },
    filteredCars() {
      // Logic for filtering remains the same
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.sortedCars;
      return this.sortedCars.filter(car =>
          Object.values(car).some(value => String(value).toLowerCase().includes(query))
      );
    },
  },
  methods: {
    fetchCars() {
      // Fetching logic remains the same
      this.loading = true;
      api.get("/api/v1/admin/cars")
          .then(response => {
            if (response.data && response.data.status === "success") {
              this.cars = response.data.data || [];
            } else {
              this.cars = [];
            }
          })
          .catch(error => this.handleApiError(error, "fetch cars"))
          .finally(() => this.loading = false);
    },
    /**
     * Navigates to the dedicated edit page for a specific car.
     * @param {string} uuid - The UUID of the car to edit.
     */
    navigateToEdit(uuid) {
      this.$router.push({ name: 'UpdateCar', params: { uuid: uuid } });
    },
    // The rest of the methods (deleteCar, confirmDelete, openCarView, etc.) remain largely the same.
    deleteCar(car) {
      this.carToDelete = car;
      this.showConfirmationModal = true;
    },
    cancelDelete() {
      this.showConfirmationModal = false;
      this.carToDelete = null;
    },
    confirmDelete() {
      if (!this.carToDelete) return;
      this.loading = true;
      api.delete(`/api/v1/admin/cars/${this.carToDelete.uuid}`)
          .then(() => {
            this.showSuccessModal(`Car '${this.carToDelete.make} ${this.carToDelete.model}' was deleted.`);
            this.fetchCars(); // Refresh the list
          })
          .catch(error => this.handleApiError(error, "delete car"))
          .finally(() => {
            this.loading = false;
            this.cancelDelete();
          });
    },
    openCarView(uuid) {
      this.$router.push({ name: 'ViewCar', params: { uuid: uuid } });
    },
    sortCars(sortBy) { this.sortBy = sortBy; },
    resetSearch() { this.searchQuery = ""; },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    handleApiError(error, action) {
      const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || `Failed to ${action}.`;
      this.failModal = { show: true, message: errorMsg };
      console.error(`Error during ${action}:`, error);
    }
  },
  created() {
    this.fetchCars();
  },
};
</script>

<style scoped>
/* Add your shared table/management styles here */
.status-available { color: #28a745; }
.status-unavailable { color: #dc3545; }
.actions-buttons { display: flex; gap: 5px; }
.actions-buttons .button { padding: 5px 10px; font-size: 0.8rem; }
.no-data-container { text-align: center; padding: 40px; }
</style>