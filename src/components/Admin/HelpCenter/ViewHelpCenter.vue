```vue
<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin" v-if="!loading && helpCenter">
      <div class="form-header">
        <h1><i class="fas fa-life-ring"></i> Help Center Entry</h1>
      </div>

      <hr>
      <div class="profile-details">

        <div>
          <label>Title:</label>
          <span>{{ helpCenter.title }}</span>
        </div>
        <div>
          <label>Category:</label>
          <span>{{ helpCenter.category }}</span>
        </div>
        <div>
          <label>Content:</label>
          <span>{{ helpCenter.content }}</span>
        </div>
        <div>
          <label>Created At:</label>
          <span>{{ formatDate(helpCenter.createdAt) }}</span>
        </div>
        <div>
          <label>Updated At:</label>
          <span>{{ formatDate(helpCenter.updatedAt) }}</span>
        </div>
      </div>
      <hr>
      <div class="button-container">
        <button class="back-button button" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </div>
    <div v-else-if="!loading && !helpCenter" class="form-container-admin">
      <p>No help center entry found.</p>
      <div class="button-container">
        <button class="back-button button" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </div>
    <loading-modal v-if="loading" :show="loading"></loading-modal>
    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    />
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "ViewHelpCenter",
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      helpCenter: null,
      loading: false,
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  mounted() {
    this.fetchHelpCenterProfile();
  },
  methods: {
    async fetchHelpCenterProfile() {
      const helpCenterId = this.$route.params.id;
      this.loading = true;
      try {
        const response = await api.get(`/api/v1/admin/help-topics/${helpCenterId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { data, errors, status } = response.data || {};
        console.log("API Response:", response.data); // Debug
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Invalid API response");
        }
        if (!data) {
          throw new Error("No help topic found");
        }
        this.helpCenter = data;
       // this.showSuccessModal("Help topic loaded successfully.");
      } catch (error) {
        let errorMessage = error.message || "Failed to fetch help topic.";
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "Help topic not found.";
          } else if (error.response.status === 401) {
            errorMessage = "Unauthorized. Please log in again.";
            this.$router.push("/login");
          } else if (error.response.status === 500) {
            errorMessage = error.response.data.errors?.join(", ") || "Server error. Please try again later.";
          }
        }
        this.showFailureModal(errorMessage);
        console.error("Error fetching help topic:", error);
      } finally {
        this.loading = false;
      }
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
    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>

</style>
```