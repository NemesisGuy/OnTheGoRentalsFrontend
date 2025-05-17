<template>
  <div class="card-container card-container-admin">
    <div class="form-container" v-if="!loading">
      <h1>Help Center Entry</h1>
      <hr>
      <div  class="profile-details" v-if="helpCenter">
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
<!--
  <div v-if="loading" class="loading">Loading...</div>
-->
  <loading-modal v-if="loading" show> </loading-modal>
</template>

<script>
import axios from 'axios';
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default {
  name: 'ViewHelpCenter',
  components : {
    LoadingModal,

  },
  data() {
    return {
      helpCenter: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchHelpCenterProfile();
  },
  methods: {
    fetchHelpCenterProfile() {
      const helpCenterId = this.$route.params.id;
      this.loading = true;
      api
          .get(`/api/admin/help-center/read/${helpCenterId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then((response) => {
            this.loading = false;
            this.helpCenter = response.data;
          })
          .catch((error) => {
            this.loading = false;
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

