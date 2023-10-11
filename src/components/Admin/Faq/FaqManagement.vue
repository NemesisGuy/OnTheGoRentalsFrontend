<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-question-circle"></i> FAQ Management</h1>
      <div>
        <router-link to="/admin/faq/create" class="add-button button">
          <i class="fas fa-question-circle"></i> Add New FAQ
        </router-link>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th>ID</th>
        <th>Question</th>
        <th>Answer</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="faq in faqs" :key="faq.id">
        <td v-if="!faq.editing">{{ faq.id }}</td>
        <td v-else>
          <input type="text" v-model="faq.id" disabled>
        </td>
        <td v-if="!faq.editing">{{ faq.question }}</td>
        <td v-else>
          <input type="text" v-model="faq.question">
        </td>
        <td v-if="!faq.editing">{{ faq.answer }}</td>
        <td v-else>
          <input type="text" v-model="faq.answer" class="answer-input">
        </td>
        <td>
          <template v-if="!faq.editing">
            <button @click="deleteFaq(faq.id)" class="delete-button button"><i class="fas fa-trash"></i> Delete</button>
          </template>
          <div v-if="faq.idToDelete === faq.id" class="delete-confirmation">
            <h1>Delete FAQ</h1>
            <p>Are you sure you want to delete this FAQ?</p>
            <button class="update-button button" @click="confirmDelete(faq.id)">Delete</button>
            <button class="deny-button button" @click="cancelDelete(faq.id)">Cancel</button>
          </div>
<!--          <button @click="editFaq(faq)" class="update-button">-->
<!--            <i class="fas fa-edit"></i> Edit-->
<!--          </button>-->
          <button @click="openFaqView(faq.id)" class="read-button button">
            <i class="fas fa-eye"></i> Read
          </button>
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
      faqs: [],
    };
  },
  methods: {
    fetchFaqs() {
      axios
          .get("http://localhost:8080/api/admin/faq/get-all")
          .then((response) => {
            this.faqs = response.data;
          })
          .catch((error) => {
            console.error(error);
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
      axios
          .delete(`http://localhost:8080/api/admin/faq/delete/${faqId}`)
          .then(() => {
            console.log("FAQ deleted successfully");
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
    // editFaq(faq) {
    //   faq.editing = true;
    // },
    // saveFaq(faq) {
    //   this.pushUpdatedFaq(faq);
    //   faq.editing = false;
    // },
    // pushUpdatedFaq(faq) {
    //   axios
    //       .put(`http://localhost:8080/api/admin/faq/update/${faq.id}`, faq)
    //       .then((response) => {
    //         console.log(response);
    //       })
    //       .catch((error) => {
    //         console.error(error);
    //       });
    // },
    // cancelEdit(faq) {
    //   faq.editing = false;
    // },
    openFaqView(id) {
      this.$router.push(`/admin/faq/view/${id}`);
    },
  },
  created() {
    this.fetchFaqs();
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
  vertical-align: middle;
}
</style>





