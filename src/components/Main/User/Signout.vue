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
.confirmation-modal {
  color: black;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #f8f8f8;
  padding: 20px;
  border: 1px solid #ccc;
  text-align: center;
  border-radius: 5px;
}
.message {
  font-size: 1.2em;
  margin-bottom: 20px;
}
.yes-button, .no-button {
  background-color: rgba(255, 0, 77, 0.99);
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  margin: 0 5px;
  border-radius: 5px;
  outline: none;
  transition: background-color 0.3s;
}
.yes-button:hover, .no-button:hover {
  background-color: rgba(190, 4, 61, 0.99);
}
</style>
