<template>
    <div class= "card-container">
        <div class="form-container" @submit.prevent="about">
            <div>
                <div class="form-header">
                    <h2> About Us</h2>
                </div>
                <hr>
                <div class="profile-info" v-if="about">
                    <p><strong><i class="fa fa-map-marker"></i> Address:</strong> {{ about.address }}</p>
                    <p><strong><i class="fa fa-calendar"></i> Office Hours:</strong> {{ about.officeHours }}</p>
                    <p><strong><i class="fas fa-envelope"></i> Email:</strong> {{ about.email }}</p>
                    <p><strong><i class="fas fa-phone"></i> Telephone Number:</strong> {{ about.telephone }}</p>
                    <p><strong><i class="fa fa-mobile" aria-hidden="true"></i> WhatsApp Number:</strong> {{ about.whatsApp }}</p>
                </div>
                <div v-else>
                    Loading...
                </div>
        </div>
        </div>
    </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'AboutUs',
  data() {
    return {
      about: null, // Use null or an empty object to represent a single AboutUs entity
    };
  },
  mounted() {
    this.fetchAboutUs();
    console.log('About Us component mounted');
  },
  methods: {
    fetchAboutUs() {
      axios
          .get('http://localhost:8080/api/aboutUs/latest') // Fetch the latest AboutUs entry
          .then(response => {
            this.about = response.data; // Assign the response data directly to about
            console.log('Fetched AboutUs data:', this.about);
          })
          .catch(error => {
            console.error('Error fetching about us data:', error);
          });
    },
  },
};
</script>

<style>

</style>


