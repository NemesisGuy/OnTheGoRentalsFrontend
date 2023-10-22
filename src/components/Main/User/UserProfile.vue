<!--<template>-->
<!--  <div class="card-container">-->
<!--    <div class="form-container">-->
<!--      <div>-->
<!--        <div class="form-header">-->
<!--          <h2><i class="fas fa-user"></i> Welcome to Your Profile</h2>-->
<!--        </div>-->
<!--        <hr>-->
<!--        <div class="profile-info">-->
<!--          <div class="profile-image">-->
<!--           <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="Profile Image" class="avatar">-->
<!--            <img v-else src="@/assets/Images/Defaults/default-user-avatar.png" alt="Placeholder Image" class="avatar">-->
<!--          </div>-->
<!--          <hr>-->
<!--          <p><strong><i class="fas fa-user"></i> Username:</strong> {{ user.userName }}</p>-->
<!--          <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>-->
<!--          <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>-->
<!--          <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>-->
<!--          <p><strong><i class="fas fa-phone"></i> Phone Number:</strong> {{ user.phoneNumber }}</p>-->

<!--          &lt;!&ndash; Add more profile information as needed &ndash;&gt;-->
<!--          <hr>-->
<!--          <div class="button-container">-->
<!--            <button @click="editProfile" class="update-button button"><i class="fa fa-pencil"></i> Edit Profile</button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import axios from "axios";-->

<!--export default {-->
<!--  data() {-->
<!--    return {-->
<!--      user: {}-->
<!--    };-->
<!--  },-->

<!--  mounted() {-->
<!-- /*   // Retrieve user profile information from your backend API-->
<!--    // You can make an HTTP request to fetch the user data-->
<!--    // Example using Axios:-->
<!--    const userId = this.$route.params.id;-->
<!--    axios.get('http://localhost:8080/api/user/profile/' + userId)-->
<!--        .then(response => {-->
<!--          this.user = response.data;-->
<!--        })-->
<!--        .catch(error => {-->
<!--          console.error(error);-->
<!--        });-->
<!--  },*/-->

<!--    /*getUserProfile() */{-->
<!--    this.loading = true;-->
<!--    axios-->
<!--        .get("http://localhost:8080/api/user/profile", {-->
<!--          headers: {-->
<!--            Authorization: `Bearer ${localStorage.getItem('token')}`-->
<!--          }-->
<!--        })-->
<!--        .then(response => {-->
<!--          // Handle success-->
<!--          console.log("User profile received");-->
<!--          console.log(response);-->
<!--          this.loading = false;-->
<!--          this.userProfile = response.data;-->
<!--        })-->
<!--        .catch(error => {-->
<!--          // Handle error-->
<!--          this.loading = false;-->
<!--          console.log("An error occurred while fetching user profile");-->
<!--          console.log(error);-->
<!--        });-->
<!--  }},-->
<!--  methods: {-->
<!--    editProfile() {-->
<!--      // Redirect the user to the edit profile page-->
<!--      this.$router.push("/edit-profile"); // Adjust the route as per your application structure-->
<!--    }-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.profile-info {-->
<!--  margin-top: 20px;-->
<!--}-->
<!--.avatar {-->
<!--  width: 100px; /* Set the desired width */-->
<!--  height: 100px; /* Set the desired height */-->
<!--  object-fit: cover; /* Maintain aspect ratio */-->
<!--}-->
<!--.profile-image {-->
<!--  text-align: center;-->
<!--}-->


<!--</style>-->

<template>
  <div class="card-container">
    <div class="form-container">
      <div>
        <div class="form-header">
          <h2><i class="fas fa-user"></i> Welcome to Your Profile</h2>
        </div>
        <hr>
        <div class="profile-info">
          <div class="profile-image">
            <img v-if="user.profileImageUrl" :src="user.profileImageUrl" alt="Profile Image" class="avatar">
            <img v-else src="@/assets/Images/Defaults/default-user-avatar.png" alt="Placeholder Image" class="avatar">
          </div>
          <hr>
<!--          <p><strong><i class="fas fa-user"></i> Username:</strong> {{ user.userName }}</p>-->
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ user.email }}</p>
          <p><strong><i class="fas fa-user"></i> First Name:</strong> {{ user.firstName }}</p>
          <p><strong><i class="fas fa-user"></i> Last Name:</strong> {{ user.lastName }}</p>
<!--          <p><strong><i class="fas fa-phone"></i> Phone Number:</strong> {{ user.phoneNumber }}</p>-->

          <!-- Add more profile information as needed -->
          <hr>
          <div class="button-container">
            <button @click="editProfile" class="update-button button"><i class="fa fa-pencil"></i> Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:8080';

axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
);

export default {
  data() {
    return {
      user: {}
    };
  },

  mounted() {
    const token = localStorage.getItem('token');
    console.log(token);

    if (token) {
      axios
          .get(`http://localhost:8080/api/user/profile/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            this.user = response.data;
          })
          .catch(error => {
            console.error(error);
          });
    } else {
      console.error('Token not found');
    }
  },

  methods: {
    editProfile() {
      this.$router.push("/edit-profile");
      // this.$router.push( {name : "/edit-profile"} );
    },
  },
};
</script>

<style scoped>
.profile-info {
  margin-top: 20px;
}
.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
.profile-image {
  text-align: center;
}
</style>

