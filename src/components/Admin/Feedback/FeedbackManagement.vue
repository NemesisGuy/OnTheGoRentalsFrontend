<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-comment"></i> Feedback Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text"/>
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link to="/admin/feedback/create" class="add-button button">
            <i class="fas fa-plus"></i> Add New Feedback
          </router-link>
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th @click="sortFeedback('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortFeedback('name')">Name <i class="fas fa-sort"></i></th>
        <th @click="sortFeedback('comment')">Comment <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="feedback in filteredFeedback" :key="feedback.id">
        <td v-if="!feedback.editing">{{ feedback.id }}</td>
        <td v-else>
          <input v-model="feedback.id" disabled type="text">
        </td>
        <td v-if="!feedback.editing">{{ feedback.name }}</td>
        <td v-else>
          <input v-model="feedback.name" type="text">
        </td>
        <td v-if="!feedback.editing">{{ feedback.comment }}</td>
        <td v-else>
          <input v-model="feedback.comment" type="text">
        </td>
        <td>
          <template v-if="!feedback.editing">
            <button class="delete-button button" @click="deleteFeedback(feedback.id)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="editFeedback(feedback)">
              <i class="fas fa-edit"></i> Edit
            </button>
          </template>
          <template v-else>
            <button class="update-button button" @click="saveFeedback(feedback)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="delete-button button" @click="cancelEdit(feedback)">
              <i class="fas fa-times"></i> Cancel
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
      feedback: [],
      sortedFeedback: [],
      searchQuery: "",
    };
  },
  methods: {
    fetchFeedback() {
      axios
          .get("http://localhost:8080/api/admin/feedback/get-all", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then((response) => {
            this.feedback = response.data;
            this.sortedFeedback = response.data;
          })
          .catch((error) => {
            console.error("Failed to fetch feedback data:", error);
          });
    },

    sortFeedback(sortKey) {
      this.sortedFeedback = this.sortedFeedback.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1;
        if (a[sortKey] > b[sortKey]) return 1;
        return 0;
      });
    },

    deleteFeedback(feedbackId) {
      this.loading = true;
      axios
          .delete(`http://localhost:8080/api/admin/feedback/delete/${feedbackId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then(() => {
            this.showSuccessModal("Feedback deleted successfully.");
            this.fetchFeedback();
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to delete feedback. Please try again.");
          });
    },

    editFeedback(feedback) {
      feedback.editing = true;
    },

    saveFeedback(feedback) {
      this.loading = true;
      axios
          .put(`http://localhost:8080/api/admin/feedback/update/${feedback.id}`, feedback, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then(() => {
            this.showSuccessModal("Feedback updated successfully.");
            this.fetchFeedback();
          })
          .catch((error) => {
            this.loading = false;
            this.showFailureModal("Failed to update feedback. Please try again.");
          });
    },

    cancelEdit(feedback) {
      feedback.editing = false;
    },

    resetSearch() {
      this.searchQuery = "";
      this.sortedFeedback = this.feedback;
    },
  },
  computed: {

    filteredFeedback() {
      if (!this.searchQuery) {
        return this.sortedFeedback;
      }
      const query = this.searchQuery.toLowerCase();
      return this.sortedFeedback.filter((feedback) => {
        return (
            feedback.id.toString().includes(query) ||
            feedback.name.toLowerCase().includes(query) ||
            feedback.comment.toLowerCase().includes(query)
        );
      });
    },
  },
  created() {

    this.fetchFeedback();
  },
};
</script>
