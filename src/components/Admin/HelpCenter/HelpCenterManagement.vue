<template>
  <div class="content-container">
    <div class="content-header">
      <h1>
        <i class="fas fa-question-circle"></i> Help Center Management
      </h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button class="button read-button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/help-center/create" class="add-button button">
            <i class="fas fa-question-circle"></i> Add New Article
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortArticles('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('title')">Title <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('category')">Category <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('content')">Content <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('createdAt')">Created At <i class="fas fa-sort"></i></th>
        <th @click="sortArticles('updatedAt')">Updated At <i class="fas fa-sort"></i></th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="article in articles" :key="article.id">
        <td v-if="!article.editing">{{ article.id }}</td>
        <td v-else>
          <input type="text" v-model="article.id" disabled/>
        </td>
        <td v-if="!article.editing">{{ article.title }}</td>
        <td v-else>
          <input type="text" v-model="article.title"/>
        </td>
        <td v-if="!article.editing">{{ article.category }}</td>
        <td v-else>
          <input type="text" v-model="article.category"/>
        </td>
        <td v-if="!article.editing">{{ article.content }}</td>
        <td v-else>
          <textarea v-model="article.content" class="answer-input"></textarea>
        </td>
        <td v-if="!article.editing">{{ article.createdAt }}</td>
        <td v-else>
          <input type="text" v-model="article.createdAt" disabled/>
        </td>
        <td v-if="!article.editing">{{ article.updatedAt }}</td>
        <td v-else>
          <input type="text" v-model="article.updatedAt" disabled/>
        </td>
        <td>
          <!-- Actions -->
          <template v-if="!article.editing">
            <button @click="deleteArticle(article.id)" class="button delete-button">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button @click="openArticleView(article.id)" class="button read-button">
              <i class="fas fa-eye"></i> Read
            </button>
            <div v-if="article.idToDelete === article.id" class="confirmation-dialog">
              <h1>Delete Article</h1>
              <p>Are you sure you want to delete this Article?</p>
              <button @click="confirmDelete(article.id)" class="button deny-button">
                Confirm
              </button>
              <button @click="cancelDelete(article.id)" class="button deny-button">
                Cancel
              </button>
            </div>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
  </div>
</template>

<script>
import axios from "axios";
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default {
  name: "HelpCenterManagement",
  components: {
    LoadingModal,
  },
  data() {
    return {
      articles: [],
      searchQuery: "",
      loading: false,
    };
  },
  methods: {
    fetchArticles() {
      this.loading = true;
      api
          .get("/api/admin/help-center/get-all", {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
          .then((response) => {
            this.articles = response.data;
            this.loading = false;
          })
          .catch((error) => {
            console.error(error);
            this.loading = false;
          });
    },
    deleteArticle(id) {
      this.articles.forEach((article) => {
        article.idToDelete = null;
      });
      const selectedArticle = this.articles.find((article) => article.id === id);
      selectedArticle.idToDelete = id;
    },
    confirmDelete(id) {
      const articleId = id;
      api
          .delete(`/api/admin/help-center/delete/${articleId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then(() => {
            this.fetchArticles();
          })
          .catch((error) => {
            console.error(error);
          });
    },
    cancelDelete(id) {
      const selectedArticle = this.articles.find((article) => article.id === id);
      selectedArticle.idToDelete = null;
    },
    openArticleView(id) {
      this.$router.push(`/admin/help-center/view/${id}`);
    },
    resetSearch() {
      this.searchQuery = "";
      // You can implement the logic to reset the search here.
    },
    sortArticles(column) {
      // Implement sorting logic based on the selected column.
      // You can update this method to sort the articles.
    },
  },
  created() {
    this.fetchArticles();
  },
};
</script>
