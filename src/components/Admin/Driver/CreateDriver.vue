<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
    <form @submit.prevent="addDriver">
      <h2 class="form-header">Add Driver</h2>


      <div class="form-group">

        <label for="firstname">Firstname:</label>
        <input type="text" id="firstname" v-model="driver.firstName" required placeholder="Enter Firstname">
      </div>
      <div class="form-group">
        <label for="lastname">Lastname:</label>
        <input type="text" id="lastname" v-model="driver.lastName" required placeholder="Enter Lastname">
      </div>
      <div class="form-group">
        <label for="licenseCode">License Code:</label>
        <input type="text" id="licenseCode" v-model="driver.licenseCode" required placeholder="Enter license code">
      </div>
      <div class="button-container">
      <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Add</button>
      </div>
    </form>
  </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      driver: {
        firstName: "",
        lastName: "",
        licenseCode: "",
      },
    };
  },
  methods: {
    addDriver() {
      const token = localStorage.getItem('token');
      console.log("token", localStorage.getItem('token'))
      console.log("Adding driver:", this.driver);

      axios
          .post('http://localhost:8080/api/admin/drivers/create', this.driver,{
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

      console.log("Adding driver:", this.driver);



      this.resetForm();
    },
    resetForm() {
      this.driver = {
        firstName: "",
        lastName: "",
        licenseCode: "",
      };
    },
  },
};
</script>

<style scoped>

</style>