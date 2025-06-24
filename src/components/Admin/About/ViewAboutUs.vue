<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="aboutUs-details">
        <div class="form-header">
          <h2><i class="fas fa-info-circle"></i> About Us Details</h2>

        </div>
        <hr>
        <div v-if="about" class="aboutUs-details">

          <div>
            <label>Address:</label>
            <span>{{ about.address }}</span>
          </div>
          <div>
            <label>Office Hours:</label>
            <span>{{ about.officeHours }}</span>
          </div>
          <div>
            <label>Email:</label>
            <span>{{ about.email }}</span>
          </div>
          <div>
            <label>Telephone Number:</label>
            <span>{{ about.telephone }}</span>
          </div>
          <div>
            <label>WhatsApp Number:</label>
            <span>{{ about.whatsApp }}</span>
          </div>
          <hr >
        </div>
        <div class="button-container">
          <button class="back-button button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import api from "@/api";

export default {
  name: 'viewAboutUs',
  data() {
    return {
      about: null
    };
  },
  mounted() {
    this.fetchAboutUsDetails();
  },
  methods: {
    fetchAboutUsDetails() {
      const uuid = this.$route.params.uuid;
      const token = localStorage.getItem('token');

      api
          .get(`/api/v1/admin/about-us/${uuid}`)
          .then((response) => {
            this.about = response.data.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    showSuccessModal(message) {
      this.successModal = {
        show: true,
        message: message,
      };
    },
    showFailureModal(message) {
      this.failModal = {
        show: true,
        message: message,
      };
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>
<style>
</style>