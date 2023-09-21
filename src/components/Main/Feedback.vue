<template>
  <div class="feedback w-50">
    <form @submit.prevent="submitFeedback">
      <h2 class="form-header">Feedback</h2>
      <div class="form-group">
        <label for="name"><i class="fas fa-user"></i> Name:</label>
        <input class="w-100" type="text" id="name" name="name" placeholder="Enter your name" v-model="name" required>
      </div>
      <div class="form-group">
        <label for="comment"><i class="fas fa-comment"></i> Comment:</label>
        <input class="w-100" type="text" id="comment" name="comment" placeholder="Enter your feedback" v-model="comment" required>
      </div>
      <div class="d-flex justify-content-center">
        <button type="submit"><i class="fas fa-paper-plane"></i>Submit Feedback</button>
        <router-link :to="{ name: 'Signup' }"><button>Cancel</button></router-link>
      </div>
      <p>Your feedback is important to us! It helps us grow and serve you better</p>
    </form>
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
