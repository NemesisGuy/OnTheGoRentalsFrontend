<template>
  <div class="user-profile">
    <h1>User Profile</h1>
    <div v-if="user" class="profile-details">
      <div>
        <label>Username:</label>
        <span>{{ user.userName }}</span>
      </div>
      <div>
        <label>Email:</label>
        <span>{{ user.email }}</span>
      </div>
      <div>
        <label>First Name:</label>
        <span>{{ user.firstName }}</span>
      </div>
      <div>
        <label>Last Name:</label>
        <span>{{ user.lastName }}</span>
      </div>
      <div>
        <label>Phone Number:</label>
        <span>{{ user.phoneNumber }}</span>
      </div>
      <div>
        <label>Role:</label>
        <span>{{ user.role }}</span>
      </div>
    </div>
    <div v-else>
      <loading-modal v-if="loading" />
      Loading user profile...
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';


export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {

    fetchUserProfile() {
      this.loading = true;
      // Assuming you have the user ID or any other identifier to fetch the user's profile
      const userId = this.$route.params.id; // Get the user ID from the route parameter

      axios
          .get(`http://localhost:8080/api/admin/users/read/${userId}`)
          .then((response) => {
            this.user = response.data;
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
