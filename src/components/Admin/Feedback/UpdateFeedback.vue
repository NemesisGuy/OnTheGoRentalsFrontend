<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Feedback Management</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortFeedback('id')">ID</th>
          <th @click="sortFeedback('name')">Name</th>
          <th @click="sortFeedback('comment')">Comment</th>
          <th>Edit</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="feedback in sortedFeedback" :key="feedback.id">
          <td>{{ feedback.id }}</td>
          <td>
            <input v-model="feedback.name" :disabled="!feedback.editing" />
          </td>
          <td>
            <input v-model="feedback.comment" :disabled="!feedback.editing" />
          </td>
          <td>
            <button @click="toggleEditMode(feedback)">
              {{ feedback.editing ? 'Save' : 'Edit' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
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

      axios.get('http://localhost:8080/api/admin/feedback/all')
          .then((response) => {
            this.feedback = response.data.map((item) => ({
              ...item,
              editing: false,
            }));
          })
          .catch((error) => {
            console.error(error);
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
    toggleEditMode(feedback) {
      if (feedback.editing) {
        this.updateFeedback(feedback);
      }
      feedback.editing = !feedback.editing;
    },
    updateFeedback(feedback) {

      axios.put(`http://localhost:8080/api/admin/feedback/${feedback.id}`, feedback)
          .then((response) => {
            console.log('Feedback updated');
          })
          .catch((error) => {
            console.error(error);
            console.log('Feedback not updated');
          });
    },
  },
  computed: {
    sortedFeedback() {
      let sortedFeedback = [...this.feedback];

      if (this.sortColumn) {
        sortedFeedback.sort((a, b) => {
          let valueA = a[this.sortColumn];
          let valueB = b[this.sortColumn];

          if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }

          if (valueA < valueB) {
            return this.sortDirection === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return this.sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      return sortedFeedback;
    },
  },
};
</script>

<style scoped>

.content-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card-container {
  width: 80%;
  max-width: 800px;
  padding: 20px;
  background-color: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 5px;
}

table {
  width: 100%;
}

th {
  cursor: pointer;
  background-color: #333;
  color: white;
}

th,
td {
  padding: 10px;
  text-align: left;
}

th:hover {
  background-color: #555;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>

<!--<script>-->
<!--import axios from "axios";-->

<!--export default {-->
<!--  name: "EditFeedback",-->
<!--  data() {-->
<!--    return {-->
<!--      feedbackId: null,-->
<!--      name: "",-->
<!--      comment: "",-->
<!--    };-->
<!--  },-->
<!--  created() {-->

<!--  },-->
<!--  methods: {-->
<!--    updateFeedback() {-->
<!--      const feedbackData = {-->
<!--        name: this.name,-->
<!--        comment: this.comment,-->
<!--      };-->

<!--      axios-->
<!--          .put(`http://localhost:8080/feedback/update/${this.feedbackId}`, feedbackData)-->
<!--          .then(response => {-->
<!--            console.log(response.data);-->
<!--          })-->
<!--          .catch(error => {-->
<!--            console.error(error);-->
<!--          });-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->
