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
import axios from "axios";
import api from "@/api";

export default {
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
    };
  },
  methods: {
    addQuery() {
      console.log("Adding query:", this.contact)
      const token = localStorage.getItem('token');
      console.log("token", localStorage.getItem('token'))

      api
          .post("/api/v1/admin/contact-us-submissions", this.contact, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });

      console.log("Adding query:", this.contact);

      this.resetForm();
    },
    resetForm() {
      this.contact = {
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      };
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>
