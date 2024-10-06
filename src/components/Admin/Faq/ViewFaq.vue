<template>
  <div class="card-container">
    <div class="form-container">
      <div class="rental-profile">
        <h1>FAQ Profile</h1>
        <hr>
        <div class="profile-details" v-if="faq">
          <div class="section">
            <h3>FAQ Details:</h3>
            <hr>
            <div class="detail-row">
              <div>
                <label>Question:</label>
                <span>{{ faq.question }}</span>
              </div>

              <div>
                <label>Answer:</label>
                <span>{{ faq.answer }}</span>
              </div>

            </div>

          </div>

        </div>

        <div v-else>
          <p>Loading FAQ profile...</p>
        </div>

      </div>

      <div class="button-container">
        <button @click="goBack" class="back-button button "><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>



  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";

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
      api
          .get(`/api/admin/faq/read/${faqId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
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

</style>


