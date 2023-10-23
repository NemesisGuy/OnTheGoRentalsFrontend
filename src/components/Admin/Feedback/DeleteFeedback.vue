<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of Feedback</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortFeedback('id')">ID</th>
          <th @click="sortFeedback('name')">Name</th>
          <th @click="sortFeedback('email')">Email</th>
          <th @click="sortFeedback('message')">Message</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="feedback in sortedFeedback" :key="feedback.id">
          <td>{{ feedback.id }}</td>
          <td>{{ feedback.name }}</td>
          <td>{{ feedback.email }}</td>
          <td>{{ feedback.message }}</td>
          <td><button @click="deleteFeedback(feedback.id)">Delete</button></td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeleteFeedback',
  data() {
    return {
      feedback: [],
      sortColumn: '',
      sortDirection: '',
    };
  },
  mounted() {
    this.fetchFeedback();
  },
  methods: {
    fetchFeedback() {
      axios
          .get('http://localhost:8080/api/admin/feedback/all')
          .then((response) => {
            this.feedback = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    sortFeedback(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    deleteFeedback(feedbackId) {
      axios
          .delete(`http://localhost:8080/api/admin/feedback/delete/${feedbackId}`)
          .then((response) => {
            this.fetchFeedback();
            console.log(response);
            console.log('Feedback deleted');
          })
          .catch((error) => {
            console.log(error);
            console.log('Feedback not deleted');
          });
    },
  },
  computed: {
    sortedFeedback() {
      if (this.sortColumn && this.sortDirection) {
        return this.feedback.sort((a, b) => {
          const aValue = a[this.sortColumn];
          const bValue = b[this.sortColumn];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          } else {
            return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
        });
      }
      return this.feedback;
    },
  },
};
</script>
