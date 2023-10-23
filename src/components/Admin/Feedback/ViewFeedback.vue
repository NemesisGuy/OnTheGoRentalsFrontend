<template>
  <div class="card-container">
    <div class="form-container">
      <div class="feedback-profile">
        <h1>Feedback Profile</h1>
        <hr>
        <div class="profile-details" v-if="feedback">
          <div class="section">
            <h3>Feedback Details:</h3>
            <hr>
            <div class="detail-row">
              <div>
                <label>Subject:</label>
                <span>{{ feedback.subject }}</span>
              </div>
              <div>
                <label>Message:</label>
                <span>{{ feedback.message }}</span>
              </div>
              <div>
                <label>Submitted By:</label>
                <span>{{ feedback.submittedBy }}</span>
              </div>
              <div>
                <label>Submitted At:</label>
                <span>{{ feedback.submittedAt }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>Loading feedback profile...</p>
        </div>
      </div>
    </div>
    <button @click="goBack" class="back-button">
      <i class="fas fa-arrow-left"></i> Back
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ViewFeedback',
  data() {
    return {
      feedback: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchFeedbackProfile();
  },
  methods: {
    fetchFeedbackProfile() {
      this.loading = true;
      const feedbackId = this.$route.params.id;
      const token = localStorage.getItem('token');

      axios
          .get(`http://localhost:8080/api/admin/feedback/read/${feedbackId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            this.feedback = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
}

.feedback-profile {
  margin-top: 20px;
}

.feedback-profile h1 {
  margin-bottom: 10px;
}

.profile-details div {
  margin-bottom: 10px;
}

label {
  font-weight: bold;
}

span {
  margin-left: 10px;
}

.back-button {
  margin-top: 20px;
  color: black;
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
