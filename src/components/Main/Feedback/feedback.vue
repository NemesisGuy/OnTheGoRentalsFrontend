<template>
  <div>
    <div class="card-container">
      <div class="form-container">
        <h2 class="form-header"><i class="fas fa-comment"></i> Feedback</h2>
        <form @submit.prevent="submitFeedback" class="feedback-form">
          <div class="form-group">
            <label for="name"><i class="fas fa-user"></i> Your Name:</label>
            <input class="form-input" type="text" id="name" name="name" placeholder="Enter your name" v-model="name" required>
          </div>
          <div class="form-group">
            <label for="feedback"><i class="fas fa-comment"></i> Feedback:</label>
            <textarea class="form-textarea" id="feedback" name="feedback" placeholder="Enter your feedback" v-model="feedback" required></textarea>
          </div>
          <div class="button-container">
            <button type="submit" class="submit-button"><i class="fas fa-paper-plane"></i> Submit Feedback</button>
            <router-link :to="{ name: 'Signup' }" class="cancel-button"><button>Cancel</button></router-link>
          </div>
          <p class="feedback-message">Your feedback is important to us! It helps us grow and serve you better</p>
        </form>
      </div>
    </div>
    <success-modal v-if="successMessage" :message="successMessage" @close="closeSuccessModal" />
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      feedback: "",
      successMessage: "",
    };
  },
  methods: {
    submitFeedback() {
      const feedbackData = {
        name: this.name,
        feedback: this.feedback,
      };

      axios
          .post("http://localhost:8080/feedback/create", feedbackData)
          .then(response => {
            // You can handle the response here
            console.log(response.data);
            this.successMessage = "Feedback submitted successfully!";
          })
          .catch(error => {
            // Handle the error here
            console.error(error);
          });
    },
    closeSuccessModal() {
      this.successMessage = "";
    },
  },
};
</script>

<style scoped>
/* CSS styles for the feedback form */
.card-container {
  width: 70%;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button {
  background-color: #007BFF;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  display: inline-block;
  margin-left: 10px;
}

.feedback-message {
  font-size: 16px;
}
</style>
