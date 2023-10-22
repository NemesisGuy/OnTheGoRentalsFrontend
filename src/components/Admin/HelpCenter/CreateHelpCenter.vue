<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <router-view></router-view>

      <form ref="helpCenterForm" @submit.prevent="addHelpCenter">
        <div class="form-header">
          <h1>Help Center Entry</h1>
        </div>
        <div class="form-group">
          <label for="category">Title:</label>
          <input type="text" id="category" v-model="helpCenter.category" required>
        </div>
        <div class="form-group">
          <label for="category">Category:</label>
          <input type="text" id="category" v-model="helpCenter.category" required>
        </div>
        <div class="form-group">
          <label for="content">Content:</label>
          <input type="text" id="content" v-model="helpCenter.category" required>
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
          <button @click="goBack" class="deny-button button"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      helpCenter: {
        category: '',
        content: ''
      },
      errorMessage: '',
      loadingModal: {
        show: false,
      },
    };
  },
  methods: {
    addHelpCenter() {
      this.errorMessage = '';
      this.loadingModal.show = true;

      axios.post('http://localhost:8080/api/admin/help-center/create', this.helpCenter)
          .then(response => {
            console.log('Help Center entry added successfully');
            console.log(response.data);
            console.log(response);
            this.resetForm();
            this.loadingModal.show = false;
          })
          .catch(error => {
            console.log(error);
            this.loadingModal.show = false;
            if (error.response && error.response.status === 400) {
              this.errorMessage = 'Invalid data. Please check the entered values.';
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response);
            } else {
              this.errorMessage = 'An error occurred while adding the Help Center entry.';
            }
          });
    },
    resetForm() {
      this.helpCenter = {
        category: '',
        content: ''
      };
    },
    goBack() {
      this.$router.go(-1);
    }
  },
};
</script>

<style scoped>
</style>

