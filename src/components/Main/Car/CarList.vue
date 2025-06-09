<template>
  <div class="content-container">
    <div class="content-header">
      <h1>{{ pageTitle }}</h1>
      <p>Browse and manage the car inventory.</p>
    </div>

    <loading-modal v-if="loading" show :message="loadingMessage"/>

    <div v-if="!loading && cars.length === 0" class="no-cars-message">
      <p>No cars available matching your criteria.</p>
    </div>

    <table v-if="!loading && cars.length > 0" class="data-table">
      <thead>
      <tr>
        <th>Image</th>
        <th @click="sortCars('make')">Make <i class="fas fa-sort"></i></th>
        <th @click="sortCars('model')">Model <i class="fas fa-sort"></i></th>
        <th @click="sortCars('year')">Year <i class="fas fa-sort"></i></th>
        <th @click="sortCars('priceGroup')">Price Group <i class="fas fa-sort"></i></th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="car in sortedCars" :key="car.uuid" @click="viewCarDetails(car.uuid)" class="clickable-row">
        <td>
          <img
              :src="car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : defaultCarImage"
              @error="onImageError"
              alt="Car Thumbnail"
              class="car-thumbnail"
          />
        </td>
        <td>{{ car.make }}</td>
        <td>{{ car.model }}</td>
        <td>{{ car.year }}</td>
        <td>{{ car.priceGroup }}</td>
        <td>
          <span :class="['status-badge', car.available ? 'status-available' : 'status-unavailable']">
            {{ car.available ? 'Available' : 'Rented' }}
          </span>
        </td>
        <td>
          <button class="button details-button" @click.stop="viewCarDetails(car.uuid)">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="button-container">
      <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
    </div>

    <FailureModal v-if="failModal.show"
                  @close="closeModal"
                  :show="failModal.show"
                  :message="failModal.message"/>
  </div>
</template>

<script>
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import api from "@/api";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import defaultCarImage from '@/assets/Images/Defaults/default-car-image.png';

/**
 * CarList.vue
 * A flexible component for displaying lists of cars.
 * It dynamically adjusts its data source and title based on the route,
 * allowing it to be used for public-facing lists (e.g., available cars by price group)
 * and admin-facing lists (e.g., all cars, all available cars).
 */
export default {
  name: 'CarList',
  components: { LoadingModal, FailureModal },
  data() {
    return {
      cars: [],
      sortColumn: 'make',
      sortDirection: 'asc',
      loading: true,
      loadingMessage: 'Fetching cars...',
      failModal: { show: false, message: "" },
      defaultCarImage: defaultCarImage,
      pageTitle: 'Cars' // A reactive property for the title, computed property will update it
    };
  },
  /**
   * Fetches initial car data when the component is first created.
   */
  mounted() {
    this.fetchCars();
  },
  /**
   * Watches the entire route object. If any part of the route changes
   * (e.g., params, query), it will re-trigger the fetchCars method.
   * This is crucial for reacting to navigation between filtered views.
   */
  watch: {
    '$route'() {
      this.fetchCars();
    }
  },
  methods: {
    /**
     * Fetches cars from the appropriate API endpoint based on the current route.
     * It handles different scenarios for admin views and public views.
     */
    fetchCars() {
      this.loading = true;

      const adminFilter = this.$route.query.filter;
      const priceGroupParam = this.$route.params.pricegroup;
      let endpoint = '';
      let title = 'Cars'; // Default title

      if (this.$route.name === 'AdminCarList') {
        if (adminFilter === 'available') {
          title = 'Available Cars (Admin)';
          endpoint = `/api/v1/admin/cars/list/available`;
        } else {
          title = 'All Cars (Admin)';
          endpoint = `/api/v1/admin/cars`;
        }
      } else {
        // Default to public view
        title = 'All Available Cars';
        endpoint = `/api/v1/cars/available`;
        if (priceGroupParam && priceGroupParam.toLowerCase() !== 'all') {
          endpoint += `/price-group/${priceGroupParam}`;
          title = `Available ${this.capitalize(priceGroupParam)} Cars`;
        }
      }

      this.pageTitle = title;
      this.loadingMessage = `Fetching ${title.toLowerCase()}...`;

      api.get(endpoint)
          .then(response => {
            if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
              this.cars = response.data.data;
            } else {
              this.cars = []; // Handle empty or malformed data gracefully
            }
          })
          .catch(error => {
            this.cars = [];
            const msg = error.response?.data?.message || `Failed to fetch car data.`;
            this.showFailureModal(msg);
          })
          .finally(() => {
            this.loading = false;
          });
    },

    /**
     * Sets the sort column and direction.
     * @param {string} column - The key of the car property to sort by.
     */
    sortCars(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },

    /**
     * Navigates to the appropriate detail view for a car.
     * It checks if the current route is an admin route to decide the destination.
     * @param {string} uuid - The UUID of the car to view.
     */
    viewCarDetails(uuid) {
      const detailRouteName = this.$route.path.includes('/admin/') ? 'AdminCarDetails' : 'CarDetail';
      this.$router.push({ name: detailRouteName, params: { uuid: uuid } });
    },

    /**
     * Handles image loading errors by replacing the broken image with a default placeholder.
     * @param {Event} event - The error event from the <img> tag.
     */
    onImageError(event) {
      event.target.src = this.defaultCarImage;
    },

    /**
     * Triggers the failure modal with a specific message.
     * @param {string} message - The error message to display.
     */
    showFailureModal(message) {
      this.failModal = { show: true, message: message };
    },

    /**
     * Closes the failure modal.
     */
    closeModal() {
      this.failModal.show = false;
    },

    /**
     * Navigates one step back in the browser's history.
     */
    goBack() {
      this.$router.go(-1);
    },

    /**
     * A simple utility to capitalize the first letter of a string.
     * @param {string} s - The string to capitalize.
     */
    capitalize(s) {
      if (typeof s !== 'string') return '';
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  },
  computed: {
    /**
     * Returns a sorted version of the cars array based on the current sort settings.
     * This is a computed property, so it automatically re-evaluates when its dependencies change.
     * @returns {Array} The sorted array of cars.
     */
    sortedCars() {
      return [...this.cars].sort((a, b) => {
        let valA = a[this.sortColumn] || '';
        let valB = b[this.sortColumn] || '';

        // Specific numeric sort for 'year'
        if (this.sortColumn === 'year') {
          return this.sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        // Default string sort for other columns
        return this.sortDirection === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
      });
    },
  },
};
</script>

<style scoped>

.car-thumbnail {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.no-cars-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #6c757d;
  background-color: #fff;
  border-radius: 8px;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
}
.status-available {
  background-color: #28a745;
}
.status-unavailable {
  background-color: #dc3545;
}
</style>