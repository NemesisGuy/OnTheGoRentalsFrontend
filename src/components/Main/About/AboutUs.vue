<template>
  <div class="card-container">
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
import api from "@/api"; // Assuming api.js is configured for base URL and interceptors

/**
 * @file AboutUs.vue
 * @description This component displays the "About Us" information for the company.
 * It fetches data such as address, office hours, email, and contact numbers
 * from the backend API and presents it to the user.
 * @component AboutUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AboutUs',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object|null} about - Stores the fetched "About Us" information.
   *                                  Initially null until data is loaded.
   *                                  Expected to contain properties like `address`, `officeHours`, `email`, etc.
   */
  data() {
    return {
      about: null, // Use null or an empty object to represent a single AboutUs entity
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted to the DOM.
   * It triggers the fetching of "About Us" data.
   */
  mounted() {
    this.fetchAboutUs();
    console.log('About Us component mounted');
  },
  methods: {
    /**
     * Fetches the latest "About Us" information from the backend API.
     * On successful fetch, it updates the `about` data property.
     * Logs an error to the console if the fetch fails.
     * @async
     * @returns {void}
     */
    fetchAboutUs() {
      api
          .get('/api/v1/about-us/latest') // Fetch the latest AboutUs entry
          .then(response => {
            this.about = response.data.data; // Assign the response data directly to about
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


