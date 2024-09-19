<template>
  <div>
    <div v-if="showConfirmationModal" class="confirmation-modal">
      <p class="message">Are you sure you want to sign out?</p>
      <button class="yes-button" @click="confirmSignOut">Yes</button>
      <button class="no-button" @click="cancelSignOut">No</button>
    </div>
    <success-modal v-if="successModal.show" @close="closeModal">
      {{ successModal.message }}
    </success-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showConfirmationModal: true,
      successModal: {
        show: false,
        // message: "You have successfully signed out.",
      },
    };
  },
  methods: {
    confirmSignOut() {
      localStorage.removeItem("token");
      this.showConfirmationModal = false;
      this.successModal.show = true;
      this.$router.push("/");
      // setTimeout(() => {
      //
      // }, 1000);
    },
    cancelSignOut() {
      this.showConfirmationModal = false;
      this.$router.push("/");
    },
    closeModal() {
      this.successModal.show = false;
    },
  },
};
</script>

<style scoped>

</style>
