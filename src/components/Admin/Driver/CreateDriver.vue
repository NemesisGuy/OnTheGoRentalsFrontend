<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <form @submit.prevent="addDriver">
        <div class="form-header">
          <h2><i class="fas fa-user-plus"></i> Add Driver</h2>
        </div>


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

          <button class="back-button button" type="button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </form>
    </div>
    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    />
  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
  components: { LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      driver: {
        firstName: "",
        lastName: "",
        licenseCode: "",
      },
      errorMessage: "",
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      loadingModal: { show: false },
    };
  },
  methods: {
    addDriver() {
      console.log("Adding driver:", this.driver);

      api
          .post('/api/v1/admin/drivers', this.driver)
          .then((response) => {
            console.log(response);
            // Show success message
            this.successModal.message = "Driver added successfully!";
            this.successModal.show = true;


          })
          .catch((error) => {
            console.log("Error adding driver:");
            console.log(error);
            // Show error message
            this.failModal.message = "Failed to add driver. Please try again.";
            this.failModal.show = true;
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
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
      this.errorMessage = "";
      if (this.successModal.show === false) {
        this.$router.go(-1);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

</style>