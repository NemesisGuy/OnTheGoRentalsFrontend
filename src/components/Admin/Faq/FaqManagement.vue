
<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-question-circle"></i> FAQ Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>

          <router-link :to="{ name: 'CreateFaq' }" class="add-button button">
            <i class="fas fa-plus"></i> Add New FAQ
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
        <th @click="sortFaqs('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortFaqs('question')">Question <i class="fas fa-sort"></i></th>
        <th @click="sortFaqs('answer')">Answer <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-if="filteredFaqs.length === 0">
        <td colspan="4" style="text-align: center;">No FAQs found.</td>
      </tr>
      <tr v-for="faq in filteredFaqs" :key="faq.uuid">
        <td v-if="!faq.editing">{{ faq.uuid }}</td>
        <td v-else>
          <input v-model="faq.uuid" disabled type="text" />
        </td>
        <td v-if="!faq.editing">{{ faq.question }}</td>
        <td v-else>
          <input v-model="faq.question" type="text" required />
        </td>
        <td v-if="!faq.editing">{{ faq.answer }}</td>
        <td v-else>
          <input v-model="faq.answer" type="text" required />
        </td>
        <td>
          <template v-if="!faq.editing">
            <button class="read-button button" @click="openFaqView(faq.uuid)">
              <i class="fas fa-eye"></i> Read
            </button>
            <button class="update-button button" @click="editFaq(faq)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button button" @click="deleteFaq(faq)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </template>
          <template v-else>
            <button class="accept-button button" @click="saveFaq(faq)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="cancel-button button" @click="cancelEdit(faq)">
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
        @cancel="cancelDelete"
        @confirm="confirmDelete"
    >
      <template v-if="faqToDelete">
        <div>
          <p>Are you sure you want to delete this FAQ?</p>
          <hr>
          <h3>FAQ Details:</h3>
          <p>ID: {{ faqToDelete.uuid }}</p>
          <p>Question: {{ faqToDelete.question }}</p>
          <p>Answer: {{ faqToDelete.answer }}</p>
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
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "FAQManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      faqs: [],
      searchQuery: "",
      sortKey: "",
      sortOrder: 1,
      loading: false,
      showConfirmationModal: false,
      faqToDelete: null,
      originalFaqs: [],
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    filteredFaqs() {
      if (!this.searchQuery) {
        return this.faqs;
      }
      const query = this.searchQuery.toLowerCase();
      return this.faqs.filter((faq) =>
          [
            faq.id?.toString(),
            faq.question || "",
            faq.answer || "",
          ].some((field) => field?.toLowerCase().includes(query))
      );
    },
  },
  created() {
    this.fetchFaqs();
  },
  methods: {
    async fetchFaqs() {
      this.loading = true;
      try {
        const response = await api.get("/api/v1/admin/faqs");
        const { data, errors, status } = response.data || {};
        console.log("API Response:", response.data); // Debug
        if (response.status === 204 || !data || data.length === 0) {
          this.faqs = [];
          this.originalFaqs = [];
          this.loading = false;
          this.showSuccessModal("No FAQs found.");
          return;
        }
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Invalid API response");
        }
        this.faqs = data.map((faq) => ({
          ...faq,
          editing: false,
        }));
        this.originalFaqs = JSON.parse(JSON.stringify(this.faqs));
        console.log("Processed FAQs:", this.faqs); // Debug
      } catch (error) {
        this.showFailureModal(error.message || "Failed to fetch FAQs.");
        console.error("Error fetching FAQs:", error);
        if (error.response?.status === 401) {
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },
    sortFaqs(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      this.faqs.sort((a, b) => {
        const aValue = a[key] || "";
        const bValue = b[key] || "";
        return aValue.toString().localeCompare(bValue.toString(), undefined, {
          numeric: true,
        }) * this.sortOrder;
      });
    },
    deleteFaq(faq) {
      this.faqToDelete = faq;
      this.showConfirmationModal = true;
    },
    async confirmDelete() {
      if (this.faqToDelete) {
        this.loading = true;
        try {
          const response = await api.delete(`/api/v1/admin/faqs/${this.faqToDelete.uuid}`);
          const { errors, status } = response.data || {};
          if (status !== "success" || (errors && errors.length > 0)) {
            throw new Error(errors?.join(", ") || "Failed to delete FAQ");
          }
          this.showSuccessModal("FAQ deleted successfully.");
          await this.fetchFaqs();
        } catch (error) {
          this.showFailureModal(error.message || "Failed to delete FAQ.");
          console.error("Error deleting FAQ:", error);
        } finally {
          this.loading = false;
          this.showConfirmationModal = false;
          this.faqToDelete = null;
        }
      }
    },
    cancelDelete() {
      this.faqToDelete = null;
      this.showConfirmationModal = false;
    },
    editFaq(faq) {
      faq.editing = true;
    },
    async saveFaq(faq) {
      if (!faq.question || !faq.answer) {
        this.showFailureModal("Question and answer are required.");
        return;
      }
      this.loading = true;
      try {
        const payload = {
          uuid: faq.uuid,
          question: faq.question,
          answer: faq.answer,
        };
        const response = await api.put(`/api/v1/admin/faqs/${faq.uuid}`, payload);
        const { errors, status } = response.data || {};
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to update FAQ");
        }
        this.showSuccessModal("FAQ updated successfully.");
        faq.editing = false;
        await this.fetchFaqs();
      } catch (error) {
        this.showFailureModal(error.message || "Failed to update FAQ.");
        console.error("Error updating FAQ:", error);
      } finally {
        this.loading = false;
      }
    },
    cancelEdit(faq) {
      const original = this.originalFaqs.find((f) => f.id === faq.id);
      if (original) {
        Object.assign(faq, { ...original, editing: false });
      }
    },
    openFaqView(uuid) {
      //ViewFaq

      this.$router.push({ name: 'ViewFaq',  params:  { uuid:uuid } });
      //this.$router.push(`/admin/faqs/view/${uuid}`);
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
```