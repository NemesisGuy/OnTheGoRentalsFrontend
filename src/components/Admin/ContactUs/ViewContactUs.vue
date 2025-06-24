<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="contact-profile">
        <div class="form-header">
          <h2><i class="fas fa-envelope"></i> Contact Us Query Details</h2>
        </div>
        <hr>

        <div v-if="contact" class="profile-details">
          <div>
            <label>Title:</label>
            <span>{{ contact.title }}</span>
          </div>
          <div>
            <label>First Name:</label>
            <span>{{ contact.firstName }}</span>
          </div>
          <div>
            <label>Last Name:</label>
            <span>{{ contact.lastName }}</span>
          </div>
          <div>
            <label>Email:</label>
            <span>{{ contact.email }}</span>
          </div>
          <div>
            <label>Subject:</label>
            <span>{{ contact.subject }}</span>
          </div>
          <div>
            <label>Message:</label>
            <span>{{ contact.message }}</span>
          </div>
        </div>
        <div v-else>
          <loading-modal v-if="loading"/>
          Loading query...
        </div>

      </div>

      <div class="button-container">
        <button class="back-button button " @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import api from "@/api";

export default {
  name: 'ContactProfile',
  data() {
    return {
      contact: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchContact();
  },
  methods: {
    fetchContact() {
      this.loading = true;
      const uuid = this.$route.params.uuid;

      api
          .get(`/api/v1/admin/contact-us-submissions/${uuid}`)
          .then((response) => {
            this.contact = response.data.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
  components: {
    LoadingModal,
  },
};
</script>
<style>


</style>


