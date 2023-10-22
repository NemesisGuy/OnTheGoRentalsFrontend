<template>
  <div class="driver-profile">
    <h1>Driver Profile</h1>
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
    </div>
    <div v-else>
      <loading-modal v-if="loading" />
      <p>Loading driver profile...</p>
    </div>
  </div>
</template>



<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';


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
      axios
          .get(`http://localhost:8080/api/admin/drivers/read/${id}`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            this.driver = response.data;
          })
          .catch((error) => {
            console.log(error);
          });
    },
  },
  components: {
    LoadingModal,
  },
};
</script>

<style scoped>

</style>