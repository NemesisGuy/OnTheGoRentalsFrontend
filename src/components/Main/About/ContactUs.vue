<template>
  <loading-modal v-if="loadingModal" show/>
  <div class="card-container">
    <div class="form-container" @submit.prevent="contact">
      <form>
        <h2 class="form-header"><i class="fas fa-envelope"></i> Contact Us</h2>

        <div class="form-group">
          <label for="title"><i class="fas fa-user"></i> Title:</label>
          <input type="text" id="title" name="userName" placeholder="Enter your title" v-model="title" required>
        </div>

        <div class="form-group">
          <label for="first-name"><i class="fas fa-user"></i> First Name:</label>
          <input type="text" id="firstName" name="firstName" placeholder="Enter your first name" v-model="firstName"
                 required>
        </div>

        <div class="form-group">
          <label for="last-name"><i class="fas fa-user"></i> Last Name:</label>
          <input type="text" id="lastName" name="lastName" placeholder="Enter your last name" v-model="lastName"
                 required>
        </div>

        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email:</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" v-model="email" required>
        </div>

        <div class="form-group">
          <label for="subject-query"><i class="fas fa-user"></i> Subject of Query:</label>
          <input type="text" id="subject" name="subject" placeholder="Enter subject here" v-model="subject" required>
        </div>

        <div class="form-group">
          <label for="message"><i class="fas fa-envelope"></i> Message:</label>
          <input type="text" id="message" name="message" placeholder="Enter your query here" v-model="message" required>
        </div>

        <div class="button-container">
          <button class="add-button button" type="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i> Submit
          </button>
        </div>

      </form>
    </div>
  </div>
  <div class="modal-body">
    <success-modal :show="successModal.show" @close="closeModal" :message="successModal.message"/>
    <failure-modal :show="failureModal.show" @close="closeModal" :message="failureModal.message"/>
  </div>
</template>
<script>
// import axios from "axios"; // Unused, api instance is used
//import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Duplicated by convention, LoadingModal (capitalized) is registered
// import loadingModalDisplay from "@/components/Main/Modals/LoadingModal.vue"; // Renaming for clarity if used as component, or it's a flag -> This line was commented out as it's not used. The boolean flag loadingModal is used.
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue"; // Standard component import
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue"; // Imported but not used in the provided script/template
import api from "@/api";

/**
 * @file ContactUs.vue
 * @description This component provides a form for users to send contact messages or queries.
 * It includes fields for user details and the message content, handles form submission,
 * and displays success, failure, or loading states using modal dialogs.
 * @component ContactUs
 */
export default {
  /**
   * Computed properties for the component.
   * Currently empty.
   * @type {object}
   */
  computed: {},
  /**
   * Components registered for use within this component.
   * @type {object}
   * @property {Component} LoadingModal - Modal to indicate loading state during form submission.
   * @property {Component} SuccessModal - Modal to display a success message after submission.
   * @property {Component} FailureModal - Modal to display a failure message if submission encounters an error.
   * @property {Component} ConfirmationModal - Modal for confirmations (imported but not actively used in the provided code).
   */
  components: {
    LoadingModal, // Registered component
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {string} title - The title of the user sending the message (e.g., Mr., Ms.).
   * @property {string} firstName - The first name of the user.
   * @property {string} lastName - The last name of the user.
   * @property {string} email - The email address of the user.
   * @property {string} subject - The subject of the user's query.
   * @property {string} message - The content of the user's message.
   * @property {string} successMessage - (Note: defined but not directly used; successModal.message is used instead).
   * @property {string} failureMessage - (Note: defined but not directly used; failureModal.message is used instead).
   * @property {string} errorMessage - (Note: defined but not directly used).
   * @property {boolean} loadingModal - Flag to control the visibility of the loading modal.
   *                                   (Note: template uses `v-if="loadingModal"`. This is a boolean flag and distinct from the `LoadingModal` component).
   * @property {object} successModal - Object to control the success modal.
   * @property {boolean} successModal.show - Visibility state of the success modal.
   * @property {string} successModal.message - Message to display in the success modal.
   * @property {object} failureModal - Object to control the failure modal.
   * @property {boolean} failureModal.show - Visibility state of the failure modal.
   * @property {string} failureModal.message - Message to display in the failure modal.
   * @property {object} confirmationModal - Object to control the confirmation modal (Note: defined but not actively used).
   * @property {boolean} confirmationModal.show - Visibility state of the confirmation modal.
   * @property {string} confirmationModal.message - Message to display in the confirmation modal.
   */
  data() {
    return {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      successMessage: "",
      failureMessage: "",
      errorMessage: '',
      loadingModal: false, // This is a boolean flag for the v-if in the template
      successModal: {show: false, message: ""},
      failureModal: {show: false, message: ""},
      confirmationModal: {show: false, message: ""},
    };
  },
  methods: {
    /**
     * Handles the submission of the contact form.
     * It sets the loading state, sends a POST request to the backend API with the form data,
     * and then shows a success or failure modal based on the API response.
     * @async
     * @returns {void}
     */
    contact() {
      this.loadingModal = true; // Show loading modal
      api
          .post("/api/v1/contact-us", {
            title: this.title,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            subject: this.subject, // Corrected: was this.email in original, should be this.subject
            message: this.message
          })
          .then(response => {
            console.log("Message sent successfully.");
            console.log(response);
            this.loadingModal = false; // Hide loading modal
            this.successModal.message = "Message sent successfully.";
            this.successModal.show = true;
          })
          .catch(error => {
            this.loadingModal = false; // Hide loading modal
            console.log("An error occurred: message not sent");
            console.log(error);
            this.failureModal.message = "Message not sent. Please try again later."; // More user-friendly message
            this.failureModal.show = true;
            // Note: successModal.show was set to false here in original, which is fine but redundant if it wasn't true.
          });
    },
    /**
     * Closes any active modals.
     * It resets the `show` property of success and failure modals.
     * (Note: `this.showConfirmationModal` was in original but `showConfirmationModal` is not a data property,
     * it's `this.confirmationModal.show`).
     * @returns {void}
     */
    closeModal() {
      // this.showConfirmationModal = false; // showConfirmationModal is not a data property
      this.confirmationModal.show = false; // Corrected
      this.successModal.show = false;
      this.failureModal.show = false;
    },
  }
};
</script>
