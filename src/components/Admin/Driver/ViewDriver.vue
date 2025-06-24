<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <div class="driver-profile">
        <div class="form-header">
          <h2><i class="fas fa-user"></i> Driver Profile</h2>
          <hr>
        </div>

        <div v-if="driver" class="profile-details">
          <div>
            <label>First Name:</label>
            <span>{{ driver.firstName }}</span>
          </div>
          <div>
            <label>Last Name:</label>
            <span>{{ driver.lastName }}</span>
          </div>
          <div>
            <label>License Code:</label>
            <span>{{ driver.licenseCode }}</span>
          </div>
          <hr>
        </div>
        <div v-else>
          <loading-modal v-if="loading"/>
          <p>Loading driver profile...</p>
        </div>
      </div>
      <div class="button-container">
        <button class="back-button button" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import api from "@/api";


export default {
  name: 'DriverProfile',
  data() {
    return {
      driver: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchDriverProfile();
  },
  methods: {

    fetchDriverProfile() {
      const id = this.$route.params.id;
      const token = localStorage.getItem('token');
      api
          .get(`/api/v1/admin/drivers/${id}`)
          .then((response) => {
            this.driver = response.data.data;
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

<style scoped>

</style>