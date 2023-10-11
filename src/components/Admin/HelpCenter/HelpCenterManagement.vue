<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-question-circle"></i> Help Center Management</h1>
      <div>
        <router-link to="/admin/help-center/create" class="add-button button">
          <i class="fas fa-question-circle"></i> Add New Article
        </router-link>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Category</th>
        <th>Content</th>
        <th>Created At</th>
        <th>Updated At</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="article in articles" :key="article.id">
        <td v-if="!article.editing">{{ article.id }}</td>
        <td v-else>
          <input type="text" v-model="article.id" disabled>
        </td>
        <td v-if="!article.editing">{{ article.title }}</td>
        <td v-else>
          <input type="text" v-model="article.title">
        </td>
        <td v-if="!article.editing">{{ article.category }}</td>
        <td v-else>
          <input type="text" v-model="article.category">
        </td>
        <td v-if="!article.editing">{{ article.content }}</td>
        <td v-else>
          <textarea v-model="article.content" class="answer-input"></textarea>
        </td>
        <td v-if="!article.editing">{{ article.createdAt }}</td>
        <td v-else>
          <input type="text" v-model="article.createdAt" disabled>
        </td>
        <td v-if="!article.editing">{{ article.updatedAt }}</td>
        <td v-else>
          <input type="text" v-model="article.updatedAt" disabled>
        </td>
        <td>
          <template v-if="!article.editing">
            <button @click="deleteArticle(article.id)" class="delete-button button">
              <i class="fas fa-trash"></i> Delete
            </button>
            <div v-if="article.idToDelete === article.id" class="delete-button button">
              <h1>Delete Article</h1>
              <p>Are you sure you want to delete this Article?</p>
              <button class="deny-button button" @click="confirmDelete(article.id)">Delete</button>
              <button class="deny-button button" @click="cancelDelete(article.id)">Cancel</button>
            </div>
<!--            <button @click="editArticle(article)" class="update-button">-->
<!--              <i class="fas fa-edit"></i> Edit-->
<!--            </button>-->
            <button @click="openArticleView(article.id)" class="read-button button">
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      articles: [],
    };
  },
  methods: {
    fetchArticles() {
      axios
          .get("http://localhost:8080/api/admin/help-center/get-all")
          .then((response) => {
            this.articles = response.data;
          })
          .catch((error) => {
            console.error(error);
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
      axios
          .delete(`http://localhost:8080/api/admin/help-center/delete/${articleId}`)
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
    // editArticle(article) {
    //   article.editing = true;
    // },
    // saveArticle(article) {
    //   this.pushUpdatedArticle(article);
    //   article.editing = false;
    // },
    // pushUpdatedArticle(article) {
    //   axios
    //       .put(`http://localhost:8080/api/admin/help-center/update/${article.id}`, article)
    //       .then((response) => {
    //         console.log(response);
    //       })
    //       .catch((error) => {
    //         console.error(error);
    //       });
    // },
    // cancelEdit(article) {
    //   article.editing = false;
    // },
    openArticleView(id) {
      this.$router.push(`/admin/help-center/view/${id}`);
    },
  },
  created() {
    this.fetchArticles();
  },
};
</script>

<style scoped>
.answer-input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

.answer-input[disabled] {
  background-color: #f5f5f5;
}

button {
  margin: 5px;
}

.delete-confirmation {
  background: #fff;
  border: 1px solid #ccc;
  padding: 20px;
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-confirmation h1 {
  font-size: 24px;
  margin-bottom: 10px;
  color: black;
}

.delete-confirmation p {
  font-size: 16px;
  margin-bottom: 20px;
  color: black;
}

.delete-confirmation button {
  font-size: 16px;
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
}

.delete-confirmation button:hover {
  opacity: 0.8;
}


td:nth-child(3) {
  max-width: 500px;
}

td button {
  display: inline-block;
  horiz-align: center;
}
</style>