<template>
  <div class="card-container">
    <div class="form-container">
      <h1>Help Center Entry</h1>
      <hr>
      <div class="profile-details" v-if="helpCenter">
        <div>
          <label>Title:</label>
          <span>{{ helpCenter.title }}</span>
        </div>

        <div>
          <label>Category:</label>
          <span>{{ helpCenter.category }}</span>
        </div>
        <div>
          <label>Content:</label>
          <span>{{ helpCenter.content }}</span>
        </div>
        <div>
          <label>Created At:</label>
          <span>{{ helpCenter.createdAt }}</span>
        </div>
        <div>
          <label>Updated At:</label>
          <span>{{ helpCenter.updatedAt }}</span>
        </div>
      </div>
      <div v-else>
        <p>Loading Help Center entry...</p>
      </div>
      <hr>
      <div class="button-container">
        <button @click="goBack" class="button">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import api from "@/api";

export default {
  name: 'ViewHelpCenter',
  data() {
    return {
      helpCenter: null,
    };
  },
  mounted() {
    this.fetchHelpCenterProfile();
  },
  methods: {
    fetchHelpCenterProfile() {
      const helpCenterId = this.$route.params.id;

      api
          .get(`/api/admin/help-center/read/${helpCenterId}` , {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then((response) => {
            this.helpCenter = response.data;
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

