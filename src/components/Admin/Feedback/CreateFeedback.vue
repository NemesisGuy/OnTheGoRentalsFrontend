<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <LoadingModal v-if="loadingModal.show" :show="loadingModal.show"></LoadingModal>
      <form @submit.prevent="addFeedback">
        <h2 class="form-header">Add Feedback</h2>
        <div class="form-group">
          <label for="name">Name:</label>
          <input id="name" v-model="feedback.name" required type="text">
        </div>
        <div class="form-group">
          <label for="comment">Comment:</label>
          <textarea id="comment" v-model="feedback.comment" required></textarea>
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

export default {
  components: {LoadingModal, FailureModal, SuccessModal},
  data() {
    return {
      feedback: {
        name: '',
        comment: ''
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
    addFeedback() {
      this.loadingModal.show = true;

      this.errorMessage = '';
      axios.post('http://localhost:8080/feedback/create', this.feedback)
          .then(response => {
            console.log('Feedback added successfully');
            console.log(response.data);
            console.log(response);
            this.loadingModal.show = false;
            this.successModal.message = 'Feedback added successfully';
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
              this.errorMessage = 'An error occurred while adding the feedback.';
              this.failModal.message = 'An error occurred while adding the feedback.';
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
      this.feedback = {
        name: '',
        comment: ''
      };
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








































<!--<template>-->
<!--  <div class="card-container">-->
<!--    <div class="form-container">-->
<!--      <h2 class="form-header">Feedback</h2>-->
<!--      <form @submit.prevent="submitFeedback" class="feedback-form">-->
<!--        <div class="form-group">-->
<!--          <label for="name"><i class="fas fa-user"></i> Name:</label>-->
<!--          <input class="form-input" type="text" id="name" name="name" placeholder="Enter your name" v-model="name" required>-->
<!--        </div>-->
<!--        <div class="form-group">-->
<!--          <label for="comment"><i class="fas fa-comment"></i> Comment:</label>-->
<!--          <textarea class="form-textarea" id="comment" name="comment" placeholder="Enter your feedback" v-model="comment" required></textarea>-->
<!--        </div>-->
<!--        <div class="button-container">-->
<!--          <button type="submit" class="submit-button"><i class="fas fa-paper-plane"></i>Submit Feedback</button>-->
<!--          <router-link :to="{ name: 'Signup' }" class="cancel-button"><button>Cancel</button></router-link>-->
<!--        </div>-->
<!--        <p class="feedback-message">Your feedback is important to us! It helps us grow and serve you better</p>-->
<!--      </form>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->


<!--<script>-->
<!--import axios from "axios";-->

<!--export default {-->
<!--  name: "Feedback",-->
<!--  data() {-->
<!--    return {-->
<!--      name: "",-->
<!--      comment: "",-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    submitFeedback() {-->
<!--      const feedbackData = {-->
<!--        name: this.name,-->
<!--        comment: this.comment,-->
<!--      };-->

<!--      axios-->
<!--          .post("http://localhost:8080/feedback/create", feedbackData)-->
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

<!--<style scoped>-->
<!--#comment{-->
<!--  height: 100px!important-->
<!--}-->
<!--p{-->
<!--  font-size: 16px;-->
<!--}-->
<!--</style>-->
