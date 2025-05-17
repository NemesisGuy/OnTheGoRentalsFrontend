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
        <div class="button-container">
          <button class="confirm-button button" type="submit">
            <i class="fas fa-check"></i> Confirm
          </button>
          <button @click="goBack" class="deny-button button">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default {
  components: {LoadingModal},
  data() {
    return {
      helpCenter: {
        title: '',    // Add 'title' property to your helpCenter object
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

      api.post('/api/admin/help-center/create', this.helpCenter, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(response => {
        console.log('Help Center entry added successfully');
        this.resetForm();
        this.loadingModal.show = false;
      })
          .catch(error => {
            this.loadingModal.show = false;
            if (error.response && error.response.status === 400) {
              this.errorMessage = 'Invalid data. Please check the entered values.';
            } else {
              this.errorMessage = 'An error occurred while adding the Help Center entry.';
            }
          });
    },
    resetForm() {
      this.helpCenter = {
        title: '',   // Reset the 'title' field as well
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
.form-group {
  margin-bottom: 15px;
}

input[type="text"],
textarea {
  width: 100%; /* Ensure the input and textarea are full width */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box; /* Make sure padding is included in the width */
  font-size: 16px;
}

textarea {
  min-height: 120px; /* Ensure textarea is tall enough */
  resize: vertical; /* Allow vertical resizing only, or remove for fixed height */
}

button {
  margin-right: 10px;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
