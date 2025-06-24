```vue
<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form ref="helpCenterForm" @submit.prevent="addHelpCenter">
        <div class="form-header">
          <h2>    <i class="fas fa-life-ring"></i> Add Help Center Topic</h2>
        </div>
        <div class="form-group">
          <label for="title">Title:</label>
          <input id="title" v-model="helpCenter.title" type="text" required />
        </div>
        <div class="form-group">
          <label for="category">Category:</label>
          <input id="category" v-model="helpCenter.category" type="text" required />
        </div>
        <div class="form-group">
          <label for="content">Content:</label>
          <textarea id="content" v-model="helpCenter.content" required></textarea>
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="form-group button-container">

          <button type="submit" class="confirm-button button">
            <i class="fas fa-check"></i> Save
          </button>
          <button type="button" class="back-button button" @click="goBack">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>
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
  name: "CreateHelpCenter",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      helpCenter: {
        title: "",
        category: "",
        content: "",
      },
      errorMessage: "",
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      loadingModal: { show: false },
    };
  },
  methods: {
    async addHelpCenter() {
      if (!this.helpCenter.title.trim() || !this.helpCenter.category.trim() || !this.helpCenter.content.trim()) {
        this.errorMessage = "Title, category, and content are required.";
        this.failModal.message = "Title, category, and content are required.";
        this.failModal.show = true;
        return;
      }
      this.loadingModal.show = true;
      this.errorMessage = "";
      try {
        const payload = {
          title: this.helpCenter.title,
          category: this.helpCenter.category,
          content: this.helpCenter.content,
        };
        console.log("Request Payload:", payload); // Debug
        const response = await api.post("/api/v1/admin/help-topics", payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { data, errors, status } = response.data || {};
        console.log("API Response:", response.data); // Debug
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to create help topic");
        }
        this.successModal.message = "Help topic added successfully.";
        this.successModal.show = true;
        this.resetForm();
      } catch (error) {
        let errorMessage = error.message || "An error occurred while adding the help topic.";
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data.errors?.join(", ") || "Invalid data. Please check the entered values.";
          } else if (error.response.status === 401) {
            errorMessage = "Unauthorized. Please log in again.";
            this.$router.push("/login");
          } else if (error.response.status === 500) {
            errorMessage = error.response.data.errors?.join(", ") || "Server error. Please try again later.";
          }
        }
        this.errorMessage = errorMessage;
        this.failModal.message = errorMessage;
        this.failModal.show = true;
        console.error("Error creating help topic:", error);
      } finally {
        this.loadingModal.show = false;
      }
    },
    resetForm() {
      this.helpCenter = { title: "", category: "", content: "" };
    },
    goBack() {
      this.$router.go(-1);
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.errorMessage = "";
      if (this.successModal.show === false) {
        this.$router.push("/admin/help-center");
      }
    },
  },
};
</script>

<style scoped>

</style>
```