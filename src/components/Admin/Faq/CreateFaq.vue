<template>
  <div class="add-car-form form">
    <form @submit.prevent="addFaq">
      <h2 class="form-header">Add FAQ</h2>
      <div class="form-group">
        <label for="question">Question:</label>
        <input id="question" v-model="faq.question" required type="text">
      </div>
      <div class="form-group">
        <label for="answer">Answer:</label>
        <input id="answer" v-model="faq.answer" required type="text">
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div class="button-container">
        <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Submit</button>
        <button class="deny-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
      </div>

    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      faq: {
        question: '',
        answer: ''
      },
      errorMessage: ''
    };
  },
  methods: {
    addFaq() {
      this.errorMessage = '';
      axios.post('http://localhost:8080/api/admin/faq/create', this.faq)
          .then(response => {
            console.log('FAQ added successfully');
            console.log(response.data);
            console.log(response);
          })
          .catch(error => {
            console.log(error);
            if (error.response && error.response.status === 400) {
              this.errorMessage = 'Invalid data. Please check the entered values.';
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response);
            } else {
              this.errorMessage = 'An error occurred while adding the FAQ.';
            }
          });
      this.resetForm();
    },
    resetForm() {
      this.faq = {
        question: '',
        answer: ''
      };
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 5px;
}
</style>


