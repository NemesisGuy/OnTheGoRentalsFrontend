<template>
  <div class="card-container">
    <div class="form-container">
      <h2 class="form-header">Feedback</h2>
      <form @submit.prevent="submitFeedback" class="feedback-form">
        <div class="form-group">
          <label for="name"><i class="fas fa-user"></i> Name:</label>
          <input class="form-input" type="text" id="name" name="name" placeholder="Enter your name" v-model="name" required>
        </div>
        <div class="form-group">
          <label for="comment"><i class="fas fa-comment"></i> Comment:</label>
          <textarea class="form-textarea" id="comment" name="comment" placeholder="Enter your feedback" v-model="comment" required></textarea>
        </div>
        <div class="button-container">
          <button type="submit" class="submit-button"><i class="fas fa-paper-plane"></i>Submit Feedback</button>
          <router-link :to="{ name: 'Signup' }" class="cancel-button"><button>Cancel</button></router-link>
        </div>
        <p class="feedback-message">Your feedback is important to us! It helps us grow and serve you better</p>
      </form>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "Feedback",
  data() {
    return {
      name: "",
      comment: "",
    };
  },
  methods: {
    submitFeedback() {
      const feedbackData = {
        name: this.name,
        comment: this.comment,
      };

      axios
          .post("http://localhost:8080/feedback/create", feedbackData)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error(error);
          });
    },
  },
};
</script>

<style scoped>
#comment{
  height: 100px!important
}
p{
  font-size: 16px;
}
</style>
