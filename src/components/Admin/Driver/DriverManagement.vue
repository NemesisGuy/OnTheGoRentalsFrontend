<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-id-card" aria-hidden="true"></i>
        Driver Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" to="/admin/drivers/create">
            <i class="fa fa-plus" aria-hidden="true"></i> Add Driver
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortDrivers('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortDrivers('firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortDrivers('lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortDrivers('licenseCode')">License Code <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="driver in sortedDrivers" :key="driver.id">
        <td v-if="!driver.editing">{{ driver.id }}</td>
        <td v-else>
          <input v-model="driver.id" disabled type="text">
        </td>


        <!-- First Name -->
        <td v-if="!driver.editing">{{ driver.firstName }}</td>
        <td v-else>
          <input v-model="driver.firstName" type="text">
        </td>

        <!-- Last Name -->
        <td v-if="!driver.editing">{{ driver.lastName }}</td>
        <td v-else>
          <input v-model="driver.lastName" type="text">
        </td>

        <!-- License Code -->
        <td v-if="!driver.editing">{{ driver.licenseCode }}</td>
        <td v-else>
          <input v-model="driver.licenseCode" type="text">
        </td>


        <!-- Actions -->
        <td>
          <template v-if="!driver.editing">
            <button class="delete-button button" @click="deleteDriver(driver)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="editDriver(driver)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="openDriverView(driver.id)">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button class="update-button button" @click="saveDriver(driver)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="delete-button button" @click="cancelEdit(driver)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>

        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelDeleteDriver"
        @confirm="confirmDeleteDriver"
    >
      <template v-if="driverToDeleteId">
        <div>
          <p>Are you sure you want to delete this driver?</p>
          <hr>
          <p>User ID: {{ driverToDeleteId.id }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show"
                  @cancel="closeModal"
                  @close="closeModal"></SuccessModal>
    <FailureModal v-if="failModal.show" :message="failModal.message" :show="failModal.show" @cancel="closeModal"
                  @close="closeModal"></FailureModal>
  </div>
</template>

<script>
import axios from "axios";
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "DriversManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      drivers: [],
      sortedDrivers: [],
      searchQuery: "",
      loading: false,
      showConfirmationModal: false,
      driverToDeleteId: null,
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
    getDrivers() {
      this.loading = true;
      const token = localStorage.getItem('token');
      console.log("token", localStorage.getItem('token'))
      api
          .get("/api/admin/drivers/get-all")
          .then((response) => {
            this.drivers = response.data;
            this.sortedDrivers = response.data;
            this.loading = false;
            console.log("token", localStorage.getItem('token'))
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to fetch drivers. Please try again.");
            console.log("token", localStorage.getItem('token'))
          });
    },
    sortDrivers(sortKey) {
      this.sortedDrivers = this.sortedDrivers.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1;
        if (a[sortKey] > b[sortKey]) return 1;
        return 0;
      });
    },
    deleteDriver(driver) {
      this.driverToDeleteId = driver;
      this.showConfirmationModal = true;
    },
    confirmDeleteDriver() {
      if (this.driverToDeleteId) {
        const id = this.driverToDeleteId.id;
        this.loading = true;
        const token = localStorage.getItem('token');
        console.log("token", localStorage.getItem('token'))
        api
            .delete(`/api/admin/drivers/delete/${this.driverToDeleteId.id}`)
            .then(() => {
              this.showSuccessModal("Driver deleted successfully.");
              this.getDrivers();
            })
            .catch((error) => {
              this.loading = false;
              this.showFailureModal("Failed to delete driver. Please try again.");
            });
      }
      this.driverToDeleteId = null;
      this.showConfirmationModal = false;
    },
    cancelDeleteDriver() {
      this.driverToDeleteId = null;
      this.showConfirmationModal = false;
    },
    editDriver(driver) {
      driver.editing = true;
    },
    saveDriver(driver) {
      driver.editing = false;
      this.loading = true;
      const token = localStorage.getItem('token');
      console.log("token", localStorage.getItem('token'))
      api
          .put(`/api/admin/drivers/update/${driver.id}`, driver)
          .then(() => {
            this.showSuccessModal("Driver updated successfully.");
            this.getDrivers();
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to update driver. Please try again.");
            console.log("token", localStorage.getItem('token'))
          });
    },
    cancelEdit(driver) {
      driver.editing = false;
    },
    openDriverView(id) {
      this.$router.push(`/admin/drivers/read/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    },
    resetSearch() {
      this.searchQuery = "";
      this.sortedDrivers = this.drivers;
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
  },
  computed: {
    filteredDrivers() {
      if (!this.searchQuery) {
        return this.sortedDrivers;
      }
      return this.sortedDrivers.filter((driver) => {
        return (
            driver.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            driver.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            driver.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            driver.licenseCode.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    },
  },
  created() {
    this.getDrivers();
  },
};
</script>

