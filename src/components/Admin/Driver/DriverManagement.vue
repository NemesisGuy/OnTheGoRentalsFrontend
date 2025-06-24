```vue
<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-id-card" aria-hidden="true"></i> Driver Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
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
<!--    <button class="back-button button" @click="goBack">
      <i class="fas fa-arrow-left"></i> Back
    </button>-->
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
      <tr v-if="filteredDrivers.length === 0">
        <td colspan="5" style="text-align: center;">No drivers found.</td>
      </tr>
      <tr v-for="driver in filteredDrivers" :key="driver.uuid">
        <td v-if="!driver.editing">{{ driver.uuid }}</td>
        <td v-else>
          <input v-model="driver.id" disabled type="text" />
        </td>
        <td v-if="!driver.editing">{{ driver.firstName }}</td>
        <td v-else>
          <input v-model="driver.firstName" type="text" required />
        </td>
        <td v-if="!driver.editing">{{ driver.lastName }}</td>
        <td v-else>
          <input v-model="driver.lastName" type="text" required />
        </td>
        <td v-if="!driver.editing">{{ driver.licenseCode }}</td>
        <td v-else>
          <input v-model="driver.licenseCode" type="text" required />
        </td>
        <td>
          <template v-if="!driver.editing">
            <button class="read-button button" @click="openDriverView(driver.uuid)">
              <i class="fas fa-eye"></i> Read
            </button>
            <button class="update-button button" @click="editDriver(driver)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button button" @click="deleteDriver(driver)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </template>
          <template v-else>
            <button class="accept-button button" @click="saveDriver(driver)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="cancel-button button" @click="cancelEdit(driver)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" :show="loading"></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelDeleteDriver"
        @confirm="confirmDeleteDriver"
    >
      <template v-if="driverToDelete">
        <div>
          <p>Are you sure you want to delete this driver?</p>
          <hr>
          <h3>Driver Details:</h3>
          <p>ID: {{ driverToDelete.uuid }}</p>
          <p>Name: {{ driverToDelete.firstName }} {{ driverToDelete.lastName }}</p>
          <p>License Code: {{ driverToDelete.licenseCode }}</p>
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
        @accept="closeModal"
        @confirm="closeModal"

    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
        @accept="closeModal"
        @confirm="closeModal"


    />
  </div>
</template>

<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
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
      searchQuery: "",
      sortKey: "",
      sortOrder: 1,
      loading: false,
      showConfirmationModal: false,
      driverToDelete: null,
      originalDrivers: [],
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    filteredDrivers() {
      if (!this.searchQuery) {
        return this.drivers;
      }
      const query = this.searchQuery.toLowerCase();
      return this.drivers.filter((driver) =>
          [
            driver.id?.toString(),
            driver.firstName || "",
            driver.lastName || "",
            driver.licenseCode || "",
          ].some((field) => field?.toLowerCase().includes(query))
      );
    },
  },
  created() {
    this.fetchDrivers();
  },
  methods: {
    async fetchDrivers() {
      this.loading = true;
      try {
        const response = await api.get("/api/v1/admin/drivers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { data, errors, status } = response.data || {};
        console.log("API Response:", response.data); // Debug
        if (response.status === 204 || !data || data.length === 0) {
          this.drivers = [];
          this.originalDrivers = [];
          this.loading = false;
/*
          this.showSuccessModal("No drivers found.");
*/
          return;
        }
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Invalid API response");
        }
        this.drivers = data.map((driver) => ({
          ...driver,
          editing: false,
        }));
        this.originalDrivers = JSON.parse(JSON.stringify(this.drivers));
        console.log("Processed Drivers:", this.drivers); // Debug
      } catch (error) {
        this.showFailureModal(error.message || "Failed to fetch drivers.");
        console.error("Error fetching drivers:", error);
        if (error.response?.status === 401) {
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },
    sortDrivers(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      this.drivers.sort((a, b) => {
        const aValue = a[key] || "";
        const bValue = b[key] || "";
        return aValue.toString().localeCompare(bValue.toString(), undefined, {
          numeric: true,
        }) * this.sortOrder;
      });
    },
    deleteDriver(driver) {
      this.driverToDelete = driver;
      this.showConfirmationModal = true;
    },
    async confirmDeleteDriver() {
      if (this.driverToDelete) {
        this.loading = true;
        try {
          const response = await api.delete(`/api/v1/admin/drivers/${this.driverToDelete.uuid}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const { errors, status } = response.data || {};
          if (status !== "success" || (errors && errors.length > 0)) {
            throw new Error(errors?.join(", ") || "Failed to delete driver");
          }
          this.showSuccessModal("Driver deleted successfully.");
          await this.fetchDrivers();
        } catch (error) {
          this.showFailureModal(error.message || "Failed to delete driver.");
          console.error("Error deleting driver:", error);
        } finally {
          this.loading = false;
          this.showConfirmationModal = false;
          this.driverToDelete = null;
        }
      }
    },
    cancelDeleteDriver() {
      this.driverToDelete = null;
      this.showConfirmationModal = false;
    },
    editDriver(driver) {
      driver.editing = true;
    },
    async saveDriver(driver) {
      if (!driver.firstName || !driver.lastName || !driver.licenseCode) {
        this.showFailureModal("All fields are required.");
        return;
      }
      this.loading = true;
      try {
        const payload = {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          licenseCode: driver.licenseCode,
        };
        const response = await api.put(`/api/v1/admin/drivers/${driver.uuid}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { errors, status } = response.data || {};
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to update driver");
        }
        this.showSuccessModal("Driver updated successfully.");
        driver.editing = false;
        await this.fetchDrivers();
      } catch (error) {
        this.showFailureModal(error.message || "Failed to update driver.");
        console.error("Error updating driver:", error);
      } finally {
        this.loading = false;
      }
    },
    cancelEdit(driver) {
      const original = this.originalDrivers.find((d) => d.uuid === driver.uuid);
      if (original) {
        Object.assign(driver, { ...original, editing: false });
      }
    },
    openDriverView(id) {
      this.$router.push(`/admin/drivers/read/${id}`);
    },
    resetSearch() {
      this.searchQuery = "";
    },
    goBack() {
      this.$router.go(-1);
    },
    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },
    showFailureModal(message) {
      this.failModal = { show: true, message };
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
  },
};
</script>

<style scoped>

</style>