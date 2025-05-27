```vue
<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-life-ring"></i> Help Center Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/help-center/create" class="add-button button">
            <i class="fas fa-plus"></i> Add New Article
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
        <th @click="sortArticles('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('title')">Title <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('category')">Category <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('content')">Content <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('createdAt')">Created At <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('updatedAt')">Updated At <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-if="filteredArticles.length === 0">
        <td colspan="7" style="text-align: center;">No articles found.</td>
      </tr>
      <tr v-for="article in filteredArticles" :key="article.uuid">
        <td v-if="!article.editing">{{ article.uuid }}</td>
        <td v-else>
          <input v-model="article.uuid" disabled type="text" />
        </td>
        <td v-if="!article.editing">{{ article.title }}</td>
        <td v-else>
          <input v-model="article.title" type="text" required />
        </td>
        <td v-if="!article.editing">{{ article.category }}</td>
        <td v-else>
          <input v-model="article.category" type="text" required />
        </td>
        <td v-if="!article.editing">{{ article.content }}</td>
        <td v-else>
          <textarea v-model="article.content" class="answer-input" required></textarea>
        </td>
        <td v-if="!article.editing">{{ formatDate(article.createdAt) }}</td>
        <td v-else>
          <input v-model="article.createdAt" disabled type="text" />
        </td>
        <td v-if="!article.editing">{{ formatDate(article.updatedAt) }}</td>
        <td v-else>
          <input v-model="article.updatedAt" disabled type="text" />
        </td>
        <td>
          <template v-if="!article.editing">
            <button class="read-button button" @click="openArticleView(article.uuid)">
              <i class="fas fa-eye"></i> Read
            </button>
            <button class="update-button button" @click="editArticle(article)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button button" @click="deleteArticle(article)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </template>
          <template v-else>
            <button class="accept-button button" @click="saveArticle(article)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="cancel-button button" @click="cancelEdit(article)">
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
      <template v-if="articleToDelete">
        <div>
          <p>Are you sure you want to delete this article?</p>
          <hr>
          <h3>Article Details:</h3>
          <p>ID: {{ articleToDelete.uuid }}</p>
          <p>Title: {{ articleToDelete.title }}</p>
          <p>Category: {{ articleToDelete.category }}</p>
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
  name: "HelpCenterManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      articles: [],
      searchQuery: "",
      sortKey: "",
      sortOrder: 1,
      loading: false,
      showConfirmationModal: false,
      articleToDelete: null,
      originalArticles: [],
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    filteredArticles() {
      if (!this.searchQuery) {
        return this.articles;
      }
      const query = this.searchQuery.toLowerCase();
      return this.articles.filter((article) =>
          [
            article.uuid?.toString(),
            article.title || "",
            article.category || "",
            article.content || "",
          ].some((field) => field?.toLowerCase().includes(query))
      );
    },
  },
  created() {
    this.fetchArticles();
  },
  methods: {
    async fetchArticles() {
      this.loading = true;
      try {
        const response = await api.get("/api/v1/admin/help-topics");
        const { data, errors, status } = response.data || {};
        console.log("API Response:", response.data); // Debug
        if (response.status === 204 || !data || data.length === 0) {
          this.articles = [];
          this.originalArticles = [];
          this.loading = false;
          this.showSuccessModal("No articles found.");
          return;
        }
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Invalid API response");
        }
        this.articles = data.map((article) => ({
          ...article,
          editing: false,
        }));
        this.originalArticles = JSON.parse(JSON.stringify(this.articles));
        console.log("Processed Articles:", this.articles); // Debug
      } catch (error) {
        this.showFailureModal(error.message || "Failed to fetch articles.");
        console.error("Error fetching articles:", error);
        if (error.response?.status === 401) {
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },
    sortArticles(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      this.articles.sort((a, b) => {
        const aValue = a[key] || "";
        const bValue = b[key] || "";
        return aValue.toString().localeCompare(bValue.toString(), undefined, {
          numeric: true,
        }) * this.sortOrder;
      });
    },
    deleteArticle(article) {
      this.articleToDelete = article;
      this.showConfirmationModal = true;
    },
    async confirmDelete() {
      if (this.articleToDelete) {
        this.loading = true;
        try {
          const response = await api.delete(`/api/v1/admin/help-topics/${this.articleToDelete.uuid}`);
          const { errors, status } = response.data || {};
          if (status !== "success" || (errors && errors.length > 0)) {
            throw new Error(errors?.join(", ") || "Failed to delete article");
          }
          this.showSuccessModal("Article deleted successfully.");
          await this.fetchArticles();
        } catch (error) {
          this.showFailureModal(error.message || "Failed to delete article.");
          console.error("Error deleting article:", error);
        } finally {
          this.loading = false;
          this.showConfirmationModal = false;
          this.articleToDelete = null;
        }
      }
    },
    cancelDelete() {
      this.articleToDelete = null;
      this.showConfirmationModal = false;
    },
    editArticle(article) {
      article.editing = true;
    },
    async saveArticle(article) {
      if (!article.title || !article.category || !article.content) {
        this.showFailureModal("Title, category, and content are required.");
        return;
      }
      this.loading = true;
      try {
        const payload = {
          id: article.uuid,
          title: article.title,
          category: article.category,
          content: article.content,
        };
        const response = await api.put(`/api/v1/admin/help-topics/${article.uuid}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { errors, status } = response.data || {};
        if (status !== "success" || (errors && errors.length > 0)) {
          throw new Error(errors?.join(", ") || "Failed to update article");
        }
        this.showSuccessModal("Article updated successfully.");
        article.editing = false;
        await this.fetchArticles();
      } catch (error) {
        this.showFailureModal(error.message || "Failed to update article.");
        console.error("Error updating article:", error);
      } finally {
        this.loading = false;
      }
    },
    cancelEdit(article) {
      const original = this.originalArticles.find((a) => a.id === article.uuid);
      if (original) {
        Object.assign(article, { ...original, editing: false });
      }
    },
    openArticleView(id) {
      this.$router.push(`/admin/help-center/view/${id}`);
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
    formatDate(date) {
      if (!date) return "";
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