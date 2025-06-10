<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <form @submit.prevent="addQuery">
        <div class="form-header">
          <h2><i class="fas fa-envelope"></i> Contact Us</h2>
        </div>
        <div class="form-group">
          <label for="title">Title:</label>
          <input id="title" v-model="contact.title" placeholder="Enter title" required type="text">
        </div>
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input id="firstName" v-model="contact.firstName" placeholder="Enter first name" required type="text">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input id="lastName" v-model="contact.lastName" placeholder="Enter last name" required type="text">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="contact.email" placeholder="Enter email" required type="email">
        </div>
        <div class="form-group">
          <label for="subject">Subject of Query:</label>
          <input id="subject" v-model="contact.subject" placeholder="Enter subject here" required type="text">
        </div>
        <div class="form-group">
          <label for="messagee">Message:</label>
          <input id="message" v-model="contact.message" placeholder="Enter your query here" required type="text">
        </div>
        <div class="button-container">
          <button class="add-button button" type="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i> Submit
          </button>
          <button class="back-button button" type="button" @click="goBack() "><i class="fas fa-arrow-left"></i> Back</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
// import axios from "axios"; // Unused
import api from "@/api";

/**
 * @file CreateContactUs.vue
 * @description Admin component for creating new "Contact Us" submissions or queries.
 * Provides a form for inputting contact details and the message content.
 * (Note: Current implementation has minimal user feedback on submission success/failure beyond console logs.)
 * @component AdminCreateContactUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminCreateContactUs',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object} contact - Object holding the form data for the new contact submission.
   * @property {string} contact.title - Title of the person submitting.
   * @property {string} contact.firstName - First name.
   * @property {string} contact.lastName - Last name.
   * @property {string} contact.email - Email address.
   * @property {string} contact.subject - Subject of the query.
   * @property {string} contact.message - The message content.
   */
  data() {
    return {
      contact: {
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      },
      // Consider adding:
      // isLoading: false,
      // successMessage: '',
      // errorMessage: '',
      // To provide user feedback.
    };
  },
  methods: {
    /**
     * Handles the submission of the new contact query form.
     * Sends a POST request to the backend API to create the submission.
     * Resets the form on successful submission.
     * (Note: User feedback on success/failure is currently limited to console logs.
     * Consider adding modals or on-page messages for better UX.)
     * @async
     * @returns {void}
     */
    addQuery() {
      console.log("Attempting to add query:", this.contact);
      // const token = localStorage.getItem('token'); // Redundant: api instance handles token

      // Basic client-side validation (can be expanded)
      if (!this.contact.firstName || !this.contact.lastName || !this.contact.email || !this.contact.subject || !this.contact.message) {
          console.error("CreateContactUs: All fields are required.");
          // Optionally, set an errorMessage data property and display it in the template
          // this.errorMessage = "All fields are required.";
          alert("Please fill in all fields."); // Simple alert for now
          return;
      }

      // this.isLoading = true; // If a loading state is added

      api.post("/api/v1/admin/contact-us-submissions", this.contact) // Manual headers removed
          .then((response) => {
            console.log('Query added successfully:', response.data);
            // Optionally, show a success message to the user
            alert("Query submitted successfully!"); // Simple alert for now
            this.resetForm(); // Reset form only on success
          })
          .catch((error) => {
            console.error('Error adding query:', error.response || error.message || error);
            // Optionally, show a detailed error message to the user
            let errorMsg = "Failed to submit query.";
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.response?.data?.errors?.length > 0) {
                errorMsg = error.response.data.errors.map(e => e.message || e.field).join('; ');
            }
            alert(`Error: ${errorMsg}`); // Simple alert for now
          })
          .finally(() => {
            // this.isLoading = false; // If a loading state is added
          });
    },
    /**
     * Resets the contact form fields to their initial empty states.
     * @returns {void}
     */
    resetForm() {
      this.contact = {
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      };
      // this.errorMessage = ""; // If using an errorMessage data property
    },
    /**
     * Navigates to the previous page in the router history.
     * @returns {void}
     */
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

</style>
