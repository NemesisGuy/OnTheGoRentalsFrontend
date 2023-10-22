<template>
  <div class="card-container">
    <div class="form-container">
      <h1>Help Center Entry</h1>
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
    </div>
    <button @click="goBack" class="back-button">
      <i class="fas fa-arrow-left"></i> Back
    </button>
  </div>
</template>

<script>
import axios from 'axios';

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

      axios
          .get(`http://localhost:8080/api/admin/help-center/read/${helpCenterId}`)
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


.help-center-profile {
  margin-top: 20px;
}

.help-center-profile h1 {
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

