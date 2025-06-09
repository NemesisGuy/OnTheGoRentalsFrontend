<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-life-ring"></i> Help Center Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset <!-- Consider changing icon to fas fa-times or fas fa-undo -->
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
      const trimmedQuery = this.searchQuery ? this.searchQuery.trim().toLowerCase() : "";

      if (!trimmedQuery) {
        return this.articles; // Return all articles if search query is empty
      }

      return this.articles.filter((article) => {
        // Ensure all fields are strings before attempting to search them.
        // This prevents errors if any field is null or undefined.
        const fieldsToSearch = [
          (article.uuid?.toString() || ""), // Handles if uuid is null, results in ""
          (article.title || ""),
          (article.category || ""),
          (article.content || ""),
        ];

        return fieldsToSearch.some((fieldString) =>
            fieldString.toLowerCase().includes(trimmedQuery)
        );
      });
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
          id: article.uuid, // Assuming your backend expects 'id' as the UUID for PUT
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
        await this.fetchArticles(); // Re-fetch to get latest data, including potentially new updatedAt
      } catch (error) {
        this.showFailureModal(error.message || "Failed to update article.");
        console.error("Error updating article:", error);
      } finally {
        this.loading = false;
      }
    },
    cancelEdit(article) {
      const original = this.originalArticles.find((a) => a.uuid === article.uuid); // Corrected to find by uuid
      if (original) {
        Object.assign(article, { ...original, editing: false });
      } else {
        // Fallback if original not found (should ideally not happen if originalArticles is kept in sync)
        article.editing = false;
        // Optionally re-fetch the single article or the whole list if data integrity is critical here
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
<!--

<style scoped>
/* Add your existing styles here if any, or new ones for responsiveness */

.content-container {
  padding: 20px;
  background-color: var(&#45;&#45;bs-gray-100);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: var(&#45;&#45;bs-gray-800);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap; /* Allow wrapping for smaller screens */
}

.content-header h1 {
  margin: 0;
  font-size: 1.8em;
  color: #333;
}
.content-header h1 .fas {
  margin-right: 10px;
  color: #007bff;
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: 10px; /* Gap between search and add button on larger screens */
  flex-wrap: wrap; /* Allow wrapping */
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap; /* Allow search input and add button to wrap */
}

.search-input {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden; /* To contain the button within rounded corners */
}

.search-input input[type="text"] {
  padding: 8px 12px;
  border: none; /* Remove default border */
  outline: none;
  font-size: 1em;
  flex-grow: 1; /* Allow input to take available space */
  min-width: 150px; /* Minimum width for the input */
}

.button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  text-decoration: none; /* For router-link */
  color: white; /* Default text color for buttons */
}

.button:hover {
  opacity: 0.9;
}
.button:active {
  transform: translateY(1px);
}

.read-button {
  background-color: #007bff; /* Blue */
  color: white;
  border-top-left-radius: 0; /* Adjust if it's inside search-input */
  border-bottom-left-radius: 0; /* Adjust if it's inside search-input */
}
.search-input .read-button { /* Specific style for reset button inside search */
  border-radius: 0; /* No radius if it's part of the input group */
}


.add-button {
  background-color: #28a745; /* Green */
  color: white;
}

.update-button {
  background-color: #ffc107; /* Yellow */
  color: #212529;
}

.delete-button {
  background-color: #dc3545; /* Red */
  color: white;
}

.accept-button {
  background-color: #17a2b8; /* Info blue */
  color: white;
}

.cancel-button {
  background-color: #6c757d; /* Gray */
  color: white;
}


table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-weight: bold;
}
th .fas.fa-sort {
  margin-left: 5px;
  opacity: 0.7;
}

tr:hover {
  background-color: #f1f1f1;
}

td input[type="text"],
td textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
td textarea.answer-input {
  min-height: 80px;
  resize: vertical;
}

.actions-column {
  width: auto; /* Adjust based on number of buttons */
  white-space: nowrap; /* Prevent buttons from wrapping within the cell */
}

.actions-column button {
  margin-right: 5px;
}
.actions-column button:last-child {
  margin-right: 0;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
  color: #555;
}

/* Responsive Table Styles */
@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px; /* Space between title and search/add section */
  }
  .search-bar-container {
    width: 100%; /* Make search container full width */
  }
  .search-bar {
    flex-direction: column; /* Stack search input and add button */
    align-items: stretch; /* Make items full width */
    width: 100%;
  }
  .search-input {
    width: 100%; /* Make search input group full width */
  }
  .search-input input[type="text"] {
    min-width: 0; /* Allow input to shrink */
  }
  .add-button {
    width: 100%; /* Make add button full width */
    justify-content: center; /* Center text/icon in button */
  }

  /* Table to Card View */
  table thead {
    display: none; /* Hide original table headers */
  }
  table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.5rem;
    background-color: var(&#45;&#45;bs-gray-100);
  }
  table td {
    display: block;
    text-align: right; /* Align content to the right */
    padding-left: 45%; /* Make space for the label */
    position: relative;
    border-bottom: 1px dotted #eee; /* Separator between "fields" */
  }
  table td:last-child {
    border-bottom: none;
  }
  table td::before {
    content: attr(data-label); /* Display the label from data-label attribute */
    position: absolute;
    left: 0.5rem;
    width: 40%; /* Adjust as needed */
    padding-right: 0.5rem;
    font-weight: bold;
    text-align: left;
    white-space: nowrap;
    color: #333;
  }
  /* Add data-label attributes to your <td> elements in the template:
     e.g., <td data-label="ID">{{ article.uuid }}</td>
            <td data-label="Title">{{ article.title }}</td>
            ... etc. for other columns ...
     For the actions column, you might not need a label or a generic one.
  */
  td.actions-cell, table td:has(> template > button) /* More robust selector for action cells */
  {
    text-align: left; /* Or center for actions */
    padding-left: 0.5rem; /* Reset padding */
    display: flex; /* Use flex for better button layout */
    flex-wrap: wrap; /* Allow buttons to wrap */
    gap: 5px; /* Space between buttons */
  }
  td.actions-cell::before, table td:has(> template > button)::before {
    display: none; /* No label for actions */
  }
  td.actions-cell button, table td:has(> template > button) button {
    flex-grow: 1; /* Allow buttons to share space */
    margin-right: 0; /* Remove individual margins if using gap */
    min-width: 80px; /* Minimum button width */
  }
  td input[type="text"],
  td textarea {
    width: 100%; /* Ensure inputs/textareas take full width of their 'card' cell */
  }
}

</style>

          -->

