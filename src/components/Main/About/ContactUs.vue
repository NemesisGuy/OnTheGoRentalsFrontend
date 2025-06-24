<template>
  <div class="content-container">
    <div class="page-header">
      <h1><i class="fas fa-envelope-open-text"></i> Get In Touch</h1>
      <p>Have a question or feedback? We'd love to hear from you.</p>
    </div>

    <div class="contact-layout-grid">
      <!-- Left Column: The Form -->
      <div class="form-panel">
        <form @submit.prevent="submitContactForm" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" v-model.trim="formData.firstName" required :class="{ 'is-invalid': validationErrors.firstName }">
              <small v-if="validationErrors.firstName" class="form-error">{{ validationErrors.firstName }}</small>
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" v-model.trim="formData.lastName" required :class="{ 'is-invalid': validationErrors.lastName }">
              <small v-if="validationErrors.lastName" class="form-error">{{ validationErrors.lastName }}</small>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" v-model.trim="formData.email" required :class="{ 'is-invalid': validationErrors.email }">
            <small v-if="validationErrors.email" class="form-error">{{ validationErrors.email }}</small>
          </div>

          <div class="form-group">
            <label for="subject">Subject</label>
            <input type="text" id="subject" v-model.trim="formData.subject" required :class="{ 'is-invalid': validationErrors.subject }">
            <small v-if="validationErrors.subject" class="form-error">{{ validationErrors.subject }}</small>
          </div>

          <div class="form-group">
            <label for="message">Your Message</label>
            <textarea id="message" v-model.trim="formData.message" rows="6" required :class="{ 'is-invalid': validationErrors.message }"></textarea>
            <small v-if="validationErrors.message" class="form-error">{{ validationErrors.message }}</small>
          </div>

          <div class="button-container">
            <button class="button send-button" type="submit" :disabled="isLoading">
              <i class="fa fa-paper-plane"></i> {{ isLoading ? 'Sending...' : 'Send Message' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Right Column: Contact Info -->
      <div class="info-panel">
        <h3 class="panel-title">Contact Information</h3>
        <p class="panel-intro">
          If you need immediate assistance, please feel free to reach out to us directly through one of the channels below.
        </p>
        <div class="detail-item">
          <i class="fas fa-envelope"></i>
          <div>
            <strong>General Inquiries</strong>
            <a href="mailto:info@ontherentals.com">info@ontherentals.com</a>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-headset"></i>
          <div>
            <strong>Support Team</strong>
            <a href="mailto:support@ontherentals.com">support@ontherentals.com</a>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-clock"></i>
          <div>
            <strong>Office Hours</strong>
            <span>Mon - Fri, 9:00 AM - 5:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <LoadingModal :show="isLoading" message="Sending your message..."/>
  <SuccessModal :show="successModal.show" @close="closeSuccessModal" :message="successModal.message"/>
  <FailureModal :show="failureModal.show" @close="closeFailureModal" :message="failureModal.message"/>
</template>

<script>
// The script logic is excellent and remains unchanged.
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  name: "ContactUs",
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      formData: { firstName: "", lastName: "", email: "", subject: "", message: "" },
      validationErrors: {},
      isLoading: false,
      successModal: { show: false, message: "" },
      failureModal: { show: false, message: "" },
    };
  },
  methods: {
    validateForm() {
      this.validationErrors = {};
      const { firstName, lastName, email, subject, message } = this.formData;
      if (!firstName) this.validationErrors.firstName = "First name is required.";
      if (!lastName) this.validationErrors.lastName = "Last name is required.";
      if (!email || !/\S+@\S+\.\S+/.test(email)) this.validationErrors.email = "Please enter a valid email address.";
      if (!subject) this.validationErrors.subject = "Subject is required.";
      if (!message) this.validationErrors.message = "Message cannot be empty.";
      return Object.keys(this.validationErrors).length === 0;
    },
    async submitContactForm() {
      if (!this.validateForm()) {
        this.showFailureModal(Object.values(this.validationErrors)[0] || "Please fill in all required fields.");
        return;
      }
      this.isLoading = true;
      try {
        const payload = { title: "User Inquiry", ...this.formData };
        await api.post("/api/v1/contact-us", payload);
        this.showSuccessModal("Your message has been sent! We will get back to you shortly.");
        this.resetForm();
      } catch (error) {
        this.showFailureModal(error.response?.data?.message || "Message could not be sent.");
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.formData = { firstName: "", lastName: "", email: "", subject: "", message: "" };
      this.validationErrors = {};
    },
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    showFailureModal(message) { this.failureModal = { show: true, message }; },
    closeSuccessModal() { this.successModal.show = false; },
    closeFailureModal() { this.failureModal.show = false; },
  }
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;

  max-width: 1200px;
  margin: auto;
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-weight: 700;
  color: #343a40;
}
.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.contact-layout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr; /* Form takes more space */
  gap: 2rem;
  align-items: flex-start;
}

.form-panel {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
}

.form-row {
  display: flex;
  gap: 1.5rem;
}
.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}
textarea {
  resize: vertical;
  min-height: 140px;
}
.is-invalid {
  border-color: #dc3545;
}
.form-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.button-container {
  margin-top: 1rem;
}
.send-button {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #007bff;
  color: white;
}

.info-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 2.5rem;
}
.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.panel-intro {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.detail-item:last-child { margin-bottom: 0; }
.detail-item i { font-size: 1.25rem; color: #007bff; width: 25px; text-align: center; margin-top: 5px; }
.detail-item div { display: flex; flex-direction: column; }
.detail-item strong { font-size: 0.8rem; color: #6c757d; text-transform: uppercase; }
.detail-item span, .detail-item a { font-size: 1rem; font-weight: 500; color: #343a40; text-decoration: none; }
.detail-item a:hover { text-decoration: underline; color: #0056b3; }

/* Responsive */
@media (max-width: 992px) {
  .contact-layout-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>