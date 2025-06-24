```vue
<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form ref="faqForm" @submit.prevent="addFaq">
        <div class="form-header">
          <h2><i class="fas fa-question-circle"></i> Add FAQ</h2>
        </div>
        <div class="form-group">
          <label for="question">Question:</label>
          <input id="question" v-model="faq.question" type="text" required />
        </div>
        <div class="form-group">
          <label for="answer">Answer:</label>
          <input id="answer" v-model="faq.answer" type="text" required />
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
  name: "CreateFAQ",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      faq: {
        question: "",
        answer: "",
      },
      errorMessage: "",
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      loadingModal: { show: false },
    };
  },
  methods: {
    async addFaq() {
      if (!this.faq.question.trim() || !this.faq.answer.trim()) {
        this.errorMessage = "Question and answer are required.";
        this.failModal.message = "Question and answer are required.";
        this.failModal.show = true;
        return;
      }
      this.loadingModal.show = true;
      this.errorMessage = "";
      try {
        const payload = {
          question: this.faq.question,
          answer: this.faq.answer,
        };
        console.log("Request Payload:", payload); // Debug
        const response = await api.post("/api/v1/admin/faqs", payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { data, errors, status } = response.data || {};
        console.log("API Response:", response.data); // Debug
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to create FAQ");
        }
        this.successModal.message = "FAQ added successfully.";
        this.successModal.show = true;
        this.resetForm();
      } catch (error) {
        let errorMessage = error.message || "An error occurred while adding the FAQ.";
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
        console.error("Error creating FAQ:", error);
      } finally {
        this.loadingModal.show = false;
      }
    },
    resetForm() {
      this.faq = { question: "", answer: "" };
    },
    goBack() {
      this.$router.go(-1);
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.errorMessage = "";
      if (this.successModal.show === false) {
        this.$router.push("/admin/faqs");
      }
    },
  },
};
</script>

<style scoped>

</style>
```