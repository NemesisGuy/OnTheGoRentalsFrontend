<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
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
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
        </div>
      </form>
    </div>

    <SuccessModal
        v-if="successModal.show"
        key="successModal"
        :message="successModal.message"
        :show="successModal.show"
        @cancel="closeModal"
        @close="closeModal"
        @confirm="closeModal"
        @ok="closeModal"
    ></SuccessModal>

    <FailureModal
        v-if="failModal.show"
        key="failModal"
        :message="failModal.message"
        :show="failModal.show"
        @cancel="closeModal"
        @close="closeModal"
    ></FailureModal>
  </div>
</template>

<script>
import axios from "axios";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";

export default {
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      faq: {
        question: '',
        answer: ''
      },
      errorMessage: '' ,
      successModal: {
        show: false,
        message: ""
      },
      failModal: {
        show: false,
        message: ""
      },
      loadingModal: {
        show: false,
      },

    };
  },
  methods: {
    addFaq() {
      this.loadingModal.show = true;

      this.errorMessage = '';
      api.post('/api/admin/faq/create', this.faq)
          .then(response => {
            console.log('FAQ added successfully');
            console.log(response.data);
            console.log(response);
            this.loadingModal.show = false;
            this.successModal.message = 'FAQ added successfully';
            this.successModal.show = true;

          })
          .catch(error => {
            console.log(error);
            if (error.response && error.response.status === 400) {
              this.errorMessage = 'Invalid data. Please check the entered values.';
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response);
              this.failModal.message = 'Invalid data. Please check the entered values.';
              this.failModal.show = true;
            } else {
              this.errorMessage = 'An error occurred while adding the FAQ.';
              this.failModal.message = 'An error occurred while adding the FAQ.';
              this.failModal.show = true;
            }
          });
      this.resetForm();
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.showConfirmationModal = false;
    },

    resetForm() {
      this.faq = {
        question: '',
        answer: ''
      };
    }
  }
};
</script>

<style scoped>

</style>
