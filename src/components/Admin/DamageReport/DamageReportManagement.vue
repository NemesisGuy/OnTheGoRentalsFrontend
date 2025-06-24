```vue
<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fa fa-book" aria-hidden="true"></i> Damage Report Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" :to="{ name: 'CreateDamageReport' }">
            <i class="fa fa-plus" aria-hidden="true"></i> Add Report
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
        <th @click="sortDamageReports('uuid')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('description')">Description <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('dateAndTime')">Date & Time <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('location')">Location <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('repairCost')">Repair Cost <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('rental.uuid')">Rental ID <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('rental.receiver')">Receiver <i class="fas fa-sort"></i></th>
        <th @click="sortDamageReports('rental.issuedDate')">Date Rented <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-if="filteredDamageReports.length === 0">
        <td colspan="9" style="text-align: center;">No damage reports found.</td>
      </tr>
      <tr v-for="damageReport in filteredDamageReports" :key="damageReport.uuid">
        <td v-if="!damageReport.editing">{{ damageReport.uuid }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.uuid" disabled />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.description }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.description" required />
        </td>
        <td v-if="!damageReport.editing">{{ formatDateTime(damageReport.dateAndTime) }}</td>
        <td v-else>
          <input type="datetime-local" v-model="damageReport.dateAndTime" required />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.location }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.location" required />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.repairCost }}</td>
        <td v-else>
          <input type="number" v-model.number="damageReport.repairCost" min="0" required />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.rental?.uuid }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.rental.uuid" disabled />
        </td>
        <td v-if="!damageReport.editing">{{ damageReport.rental?.receiver }}</td>
        <td v-else>
          <input type="text" v-model="damageReport.rental.receiver" disabled />
        </td>
        <td v-if="!damageReport.editing">{{ formatDateTime(damageReport.rental?.issuedDate) }}</td>
        <td v-else>
          <input type="datetime-local" v-model="damageReport.rental.issuedDate" disabled />
        </td>
        <td>
          <template v-if="!damageReport.editing">
            <button @click="editDamageReport(damageReport)" class="update-button button">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button @click="deleteDamageReport(damageReport)" class="delete-button button">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
            <button @click="openDamageReportView(damageReport.uuid)" class="read-button button">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button @click="saveDamageReport(damageReport)" class="accept-button button">
              <i class="fas fa-save"></i> Save
            </button>
            <button @click="cancelEdit(damageReport)" class="cancel-button button">
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
        @confirm="confirmDeleteDamageReport"
        @cancel="cancelDeleteDamageReport"
    >
      <template v-if="damageReportToDelete">
        <div>
          <p>Are you sure you want to delete this report?</p>
          <hr>
          <h3>Damage Report Details:</h3>
          <p>Rental ID: {{ damageReportToDelete.rental?.uuid || 'N/A' }}</p>
          <p>Description: {{ damageReportToDelete.description }}</p>
          <p>Date and Time: {{ formatDateTime(damageReportToDelete.dateAndTime) }}</p>
          <p>Location: {{ damageReportToDelete.location }}</p>
          <p>Repair Cost: {{ damageReportToDelete.repairCost }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal
        v-if="successModal.show"
        :show="successModal.show"
        :message="successModal.message"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :show="failModal.show"
        :message="failModal.message"
        @close="closeModal"
    />
  </div>
</template>

<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";
import { formatDateTime } from "@/utils/dateUtils";

export default {
  name: "DamageReportManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      damageReports: [],
      searchQuery: "",
      sortKey: "",
      sortOrder: 1,
      loading: false,
      showConfirmationModal: false,
      damageReportToDelete: null,
      originalDamageReports: [],
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    filteredDamageReports() {
      if (!this.searchQuery) {
        return this.damageReports;
      }
      const query = this.searchQuery.toLowerCase();
      return this.damageReports.filter((damageReport) =>
          [
            damageReport.id?.toString(),
            damageReport.description || "",
            damageReport.dateAndTime || "",
            damageReport.location || "",
            damageReport.repairCost?.toString(),
            damageReport.rental?.id?.toString(),
            damageReport.rental?.receiver || "",
            damageReport.rental?.issuedDate || "",
          ].some((field) => field?.toLowerCase().includes(query))
      );
    },
  },
  created() {
    this.fetchDamageReports();
  },
  methods: {
    formatDateTime,
    fetchDamageReports() {
      this.loading = true;
      api
          .get("/api/v1/admin/damage-reports", )
          .then((response) => {
            const { data, errors, status } = response.data || {};
            console.log("API Response:", response.data); // Debug
            if (response.status === 204 || !data || data.length === 0) {
              this.damageReports = [];
              this.originalDamageReports = [];
              this.loading = false;
              this.showSuccessModal("No damage reports found.");
              return;
            }
            if (status !== "success" || (errors && errors.length > 0)) {
              throw new Error(errors?.join(", ") || "Invalid API response");
            }
            this.damageReports = data.map((report) => ({
              ...report,
              editing: false,
            }));
            this.originalDamageReports = JSON.parse(JSON.stringify(this.damageReports));
            console.log("Processed Damage Reports:", this.damageReports); // Debug
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            const message = error.response?.status === 401
                ? "Unauthorized access. Please log in again."
                : error.message || "Failed to fetch damage reports.";
            this.showFailureModal(message);
            console.error("Error fetching damage reports:", error);
            if (error.response?.status === 401) {
              this.$router.push("/login");
            }
          });
    },
    sortDamageReports(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      this.damageReports.sort((a, b) => {
        const getValue = (obj, path) => {
          return path.split('.').reduce((acc, part) => acc && acc[part], obj) || "";
        };
        const aValue = getValue(a, key);
        const bValue = getValue(b, key);
        return aValue.toString().localeCompare(bValue.toString(), undefined, {
          numeric: true,
        }) * this.sortOrder;
      });
    },
    deleteDamageReport(damageReport) {
      this.damageReportToDelete = damageReport;
      this.showConfirmationModal = true;
    },
    confirmDeleteDamageReport() {
      if (this.damageReportToDelete) {
        this.loading = true;
        api
            .delete(`/api/v1/admin/damage-reports/${this.damageReportToDelete.uuid}`)
            .then((response) => {
              const { errors, status } = response.data || {};
              if (status !== "success" || (errors && errors.length > 0)) {
                throw new Error(errors?.join(", ") || "Failed to delete damage report");
              }
              this.showSuccessModal("Damage report deleted successfully.");
              this.fetchDamageReports();
            })
            .catch((error) => {
              this.showFailureModal(error.message || "Failed to delete damage report.");
              console.error("Error deleting damage report:", error);
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false;
              this.damageReportToDelete = null;
            });
      }
    },
    cancelDeleteDamageReport() {
      this.damageReportToDelete = null;
      this.showConfirmationModal = false;
    },
    editDamageReport(damageReport) {
      damageReport.editing = true;
    },
    saveDamageReport(damageReport) {
      if (
          !damageReport.description ||
          !damageReport.dateAndTime ||
          !damageReport.location ||
          damageReport.repairCost == null
      ) {
        this.showFailureModal("All fields are required.");
        return;
      }
      this.loading = true;
      const payload = {
        id: damageReport.id,
        description: damageReport.description,
        dateAndTime: damageReport.dateAndTime,
        location: damageReport.location,
        repairCost: damageReport.repairCost,
        rental: damageReport.rental, // Include rental if needed by backend
      };
      api
          .put(`/api/v1/admin/damage-reports/${damageReport.uuid}`, payload)
          .then((response) => {
            const { errors, status } = response.data || {};
            if (status !== "success" || (errors && errors.length > 0)) {
              throw new Error(errors?.join(", ") || "Failed to update damage report");
            }
            this.showSuccessModal("Damage report updated successfully.");
            damageReport.editing = false;
            this.fetchDamageReports();
          })
          .catch((error) => {
            this.showFailureModal(error.message || "Failed to update damage report.");
            console.error("Error updating damage report:", error);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    cancelEdit(damageReport) {
      const original = this.originalDamageReports.find((r) => r.id === damageReport.id);
      if (original) {
        Object.assign(damageReport, { ...original, editing: false });
      }
    },
    openDamageReportView(uuid) {

/*
      this.$router.push(`/admin/damage-reports/read/${uuid}`);
*/
      this.$router.push({name: 'ViewDamageReport', params: { uuid: uuid }});
    },
    resetSearch() {
      this.searchQuery = "";
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
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

</style>