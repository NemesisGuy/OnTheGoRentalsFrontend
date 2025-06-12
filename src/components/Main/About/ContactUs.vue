<template>
  <div class="card-container">
    <div class="form-container">
      <form @submit.prevent="submitContactForm" novalidate>
        <h2 class="form-header"><i class="fas fa-envelope"></i> Contact Us</h2>

        <!-- Name Fields -->
        <div class="form-row">
          <div class="form-group">
            <label for="firstName"><i class="fas fa-user"></i> First Name:</label>
            <input type="text" id="firstName" v-model.trim="formData.firstName" required autocomplete="given-name" :class="{ 'is-invalid': validationErrors.firstName }">
            <small v-if="validationErrors.firstName" class="form-text text-danger">{{ validationErrors.firstName }}</small>
          </div>
          <div class="form-group">
            <label for="lastName"><i class="fas fa-user"></i> Last Name:</label>
            <input type="text" id="lastName" v-model.trim="formData.lastName" required autocomplete="family-name" :class="{ 'is-invalid': validationErrors.lastName }">
            <small v-if="validationErrors.lastName" class="form-text text-danger">{{ validationErrors.lastName }}</small>
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email"><i class="fas fa-at"></i> Email:</label>
          <input type="email" id="email" v-model.trim="formData.email" required autocomplete="email" :class="{ 'is-invalid': validationErrors.email }">
          <small v-if="validationErrors.email" class="form-text text-danger">{{ validationErrors.email }}</small>
        </div>

        <!-- Subject -->
        <div class="form-group">
          <label for="subject"><i class="fas fa-info-circle"></i> Subject:</label>
          <input type="text" id="subject" v-model.trim="formData.subject" required :class="{ 'is-invalid': validationErrors.subject }">
          <small v-if="validationErrors.subject" class="form-text text-danger">{{ validationErrors.subject }}</small>
        </div>

        <!-- Message -->
        <div class="form-group">
          <label for="message"><i class="fas fa-comment-dots"></i> Message:</label>
          <textarea id="message" v-model.trim="formData.message" rows="5" required :class="{ 'is-invalid': validationErrors.message }"></textarea>
          <small v-if="validationErrors.message" class="form-text text-danger">{{ validationErrors.message }}</small>
        </div>

        <!-- Action Button -->
        <div class="button-container">
          <button class="add-button button" type="submit" :disabled="isLoading">
            <i class="fa fa-paper-plane"></i> {{ isLoading ? 'Sending...' : 'Send Message' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modals for feedback -->
  <div class="modal-body">
    <LoadingModal :show="isLoading" message="Sending your message..."/>
    <SuccessModal :show="successModal.show" @close="closeSuccessModal" :message="successModal.message"/>
    <FailureModal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

/**
 * @file ContactUs.vue
 * @description Provides a public-facing form for users to send inquiries or messages.
 * This component includes client-side validation and handles API submission, providing
 * clear user feedback via modals.
 *
 * @author Peter Buckingham (220165289)
 * @date 2025-06-11 (Updated)
 */
export default {
  name: "ContactUs",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      /** @type {Object} Holds all the form data in a single object. */
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        // The 'title' field was removed as it's not standard in modern forms
      },
      /** @type {Object} Holds client-side validation error messages for each field. */
      validationErrors: {},
      /** @type {boolean} Controls the loading state, disabling form elements during submission. */
      isLoading: false,
      /** @type {Object} State for the success feedback modal. */
      successModal: { show: false, message: "" },
      /** @type {Object} State for the failure feedback modal. */
      failureModal: { show: false, message: "" },
    };
  },
  methods: {
    /**
     * Validates all fields in the contact form.
     * @returns {boolean} True if the form is valid, otherwise false.
     */
    validateForm() {
      this.validationErrors = {};
      const { firstName, lastName, email, subject, message } = this.formData;
      if (!firstName) this.validationErrors.firstName = "First name is required.";
      if (!lastName) this.validationErrors.lastName = "Last name is required.";
      if (!email) {
        this.validationErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        this.validationErrors.email = "Please enter a valid email address.";
      }
      if (!subject) this.validationErrors.subject = "Subject is required.";
      if (!message) this.validationErrors.message = "Message cannot be empty.";

      return Object.keys(this.validationErrors).length === 0;
    },

    /**
     * Handles the form submission event.
     * It first validates the form, and if valid, sends the data to the backend API.
     */
    async submitContactForm() {
      if (!this.validateForm()) {
        const firstError = Object.values(this.validationErrors)[0];
        this.showFailureModal(firstError || "Please fill in all required fields.");
        return;
      }
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        // Construct the payload from the formData object
        const payload = {
          // Your backend expects a 'title', let's derive it or default it
          title: "User Inquiry",
          ...this.formData
        };

        const response = await api.post("/api/v1/contact-us", payload);

        if (response.data?.status === "success") {
          this.showSuccessModal("Your message has been sent successfully! We will get back to you shortly.");
          this.resetForm();
        } else {
          throw new Error(response.data?.errors?.[0]?.message || "An unexpected response was received from the server.");
        }

      } catch (error) {
        console.error("Contact form submission error:", error.response || error);
        const errorMsg = error.response?.data?.errors?.[0]?.message || "Message could not be sent. Please try again later.";
        this.showFailureModal(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Resets all form fields to their initial state.
     */
    resetForm() {
      this.formData = {
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      };
      this.validationErrors = {};
    },

    /**
     * Shows the success modal with a given message.
     * @param {string} message - The message to display.
     */
    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },

    /**
     * Shows the failure modal with a given message.
     * @param {string} message - The message to display.
     */
    showFailureModal(message) {
      this.failureModal = { show: true, message };
    },

    /**
     * Closes the success modal.
     */
    closeSuccessModal() {
      this.successModal.show = false;
    },

    /**
     * Closes the failure modal.
     */
    closeFailureModal() {
      this.failureModal.show = false;
    },
  }
};
</script>

<style scoped>

/* Added styling for two-column name layout */
.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.form-row .form-group {
  flex: 1 1 150px; /* Allows wrapping on smaller screens */
}

textarea {
  resize: vertical; /* Allow users to resize the textarea vertically */
  min-height: 120px;
  min-width: 590px;
}
.is-invalid {
  border-color: #dc3545;
}
</style>