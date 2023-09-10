<template>
  <div class="add-car-form form">
    <form @submit.prevent="addHelpCenter">
      <h2 class="form-header">Add Help Center Entry</h2>
      <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="helpCenter.title" required>
      </div>
      <div class="form-group">
        <label for="category">Category:</label>
        <input type="text" id="category" v-model="helpCenter.category" required>
      </div>
      <div class="form-group">
        <label for="content">Content:</label>
        <textarea id="content" v-model="helpCenter.content" required></textarea>
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i> Back
      </button>
      <button type="submit">Add Help Center Entry</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      helpCenter: {
        title: '',
        category: '',
        content: ''
      },
      errorMessage: ''
    };
  },
  methods: {
    addHelpCenter() {
      this.errorMessage = '';
      axios.post('http://localhost:8080/api/admin/help-center/create', this.helpCenter)
          .then(response => {
            console.log('Help Center entry added successfully');
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
              this.errorMessage = 'An error occurred while adding the Help Center entry.';
            }
          });
      this.resetForm();
    },
    resetForm() {
      this.helpCenter = {
        title: '',
        category: '',
        content: ''
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

