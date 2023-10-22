<template>
  <div class="content-container">

    <div class="content-header">
      <h1><i class="fas fa-question-circle"></i> FAQ Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/faq/create" class="add-button button">
            <i class="fas fa-question-circle"></i> Add New FAQ
          </router-link>
        </div>
      </div>
    </div>

    <table>
      <thead>
      <tr>
        <th @click="sortFaqs('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortFaqs('question')">Question <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="faq in filteredFaqs" :key="faq.id">
        <td v-if="!faq.editing">{{ faq.id }}</td>
        <td v-else>
          <input v-model="faq.id" disabled type="text">
        </td>
        <td v-if="!faq.editing">{{ faq.question }}</td>
        <td v-else>
          <input v-model="faq.question" type="text">
        </td>
        <td>
          <template v-if="!faq.editing">
            <button class="delete-button button" @click="deleteFaq(faq.id)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="editFaq(faq)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="openFaqView(faq.id)">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button class="update-button button" @click="saveFaq(faq)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="delete-button button" @click="cancelEdit(faq)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>

        <confirmation-modal
            :show="faq.idToDelete === faq.id"
            @cancel="cancelDelete(faq.id)"
            @confirm="confirmDelete(faq.id)"
        >
          <template>
            <div>
              <p>Are you sure you want to delete this FAQ?</p>
              <hr>
              <p>FAQ ID: {{ faq.id }}</p>
              <p>Question: {{ faq.question }}</p>
              <hr>
              <p><b>Warning!!!</b> This action cannot be undone.</p>
            </div>
          </template>
        </confirmation-modal>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import ConfirmationModal from "../../Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import deleteFaq from "@/components/Admin/Faq/DeleteFaq.vue";

axios.defaults.baseURL = 'http://localhost:8080';

axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
);

export default {
  data() {
    return {
      faqs: [],
      sortedFaqs: [],
      searchQuery: "",
      loading: false,
      showConfirmationModal: false,
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
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
    deleteFaq,
  },
  methods: {
    fetchFaqs() {
      this.loading = true;
      const token = localStorage.getItem('token');
      axios
          .get("/api/admin/faq/get-all", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            this.faqs = response.data;
            this.sortedFaqs = response.data;
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to fetch FAQs. Please try again.");
          });
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },
    sortFaqs(sortKey) {
      this.sortedFaqs = this.sortedFaqs.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1;
        if (a[sortKey] > b[sortKey]) return 1;
        return 0;
      });
    },
    deleteFaq(id) {
      this.faqs.forEach((faq) => {
        faq.idToDelete = null;
      });
      const selectedFaq = this.faqs.find((faq) => faq.id === id);
      selectedFaq.idToDelete = id;
    },
    confirmDelete(id) {
      const faqId = id;
      const token = localStorage.getItem("token");
      axios
          .delete(`/api/admin/faq/delete/${faqId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(() => {
            this.fetchFaqs();
          })
          .catch((error) => {
            console.error(error);
          });
    },
    cancelDelete(id) {
      const selectedFaq = this.faqs.find((faq) => faq.id === id);
      selectedFaq.idToDelete = null;
    },
    editFaq(faq) {
      faq.editing = true;
    },
    saveFaq(faq) {
      const token = localStorage.getItem('token');
      axios
          .put(`/api/admin/faq/update/${faq.id}`, faq, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(() => {
            this.showSuccessModal("FAQ updated successfully");
            faq.editing = false;
          })
          .catch((error) => {
            console.error(error);
            this.showFailureModal("Failed to update FAQ. Please try again.");
          });
    },
    cancelEdit(faq) {
      faq.editing = false;
    },
    openFaqView(id) {
      this.$router.push(`/admin/faq/view/${id}`);
    },
    resetSearch() {
      this.searchQuery = "";
      this.sortedFaqs = this.faqs;
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
  },
  computed: {
    filteredFaqs() {
      if (!this.searchQuery) {
        return this.sortedFaqs;
      }
      const query = this.searchQuery.toLowerCase();
      return this.sortedFaqs.filter((faq) => {
        return (
            faq.id.toString().toLowerCase().includes(query) ||
            faq.question.toLowerCase().includes(query)
        );
      });
    },
  },
  created() {
    this.fetchFaqs();
  },
};
</script>

<style scoped>
/* Add your scoped styles here */
</style>
