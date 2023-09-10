<template>
  <div class="card-container">
    <div class="faq-profile">
      <h1>FAQ Profile</h1>
      <div class="profile-details" v-if="faq">
        <div>
          <label>Question:</label>
          <span>{{ faq.question }}</span>
        </div>
        <div>
          <label>Answer:</label>
          <span>{{ faq.answer }}</span>
        </div>
      </div>
      <div v-else>
        <p>Loading FAQ profile...</p>
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
  name: 'ViewFAQ',
  data() {
    return {
      faq: null,
    };
  },
  mounted() {
    this.fetchFAQProfile();
  },
  methods: {
    fetchFAQProfile() {
      const faqId = this.$route.params.id;

      axios
          .get(`http://localhost:8080/api/admin/faq/read/${faqId}`)
          .then((response) => {
            this.faq = response.data;
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

.faq-profile {
  margin-top: 20px;
}

.faq-profile h1 {
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
}
</style>

