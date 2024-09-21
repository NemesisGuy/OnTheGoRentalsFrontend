<template>
  <div>
    <!-- Confirmation Modal for Sign Out -->
    <confirmation-modal
        :show="confirmationModalVisible"
        @confirm="confirmSignOut"
        @cancel="cancelSignOut"
    >
      <p>Are you sure you want to sign out?</p>
    </confirmation-modal>

    <!-- Success Modal after sign out -->
    <success-modal
        :show="successModalVisible"
        @close="onSuccessModalClose"
        message="You have successfully signed out!"
    >
      <!-- OK button inside success modal to confirm and reload the page -->
      <template v-slot:footer>
        <button @click="onSuccessModalClose">OK</button>
      </template>
    </success-modal>

    <!-- Failure Modal if needed -->
    <failure-modal
        :show="failureModalVisible"
        @close="hideFailureModal"
        message="Failed to sign out. Please try again."
    />
  </div>
</template>


<script>
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";

export default {
  components: {
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  data() {
    return {
      confirmationModalVisible: false,  // Initially set to false
      successModalVisible: false,
      failureModalVisible: false,
    };
  },
  mounted() {
    // Show the confirmation modal when the component is loaded
    this.confirmationModalVisible = true;
  },
  methods: {
    confirmSignOut() {
      // Clear the token
      localStorage.removeItem("token");

      // Hide confirmation modal and show success modal
      this.confirmationModalVisible = false;
      this.successModalVisible = true;
    },
    cancelSignOut() {
      // Hide the confirmation modal
      this.confirmationModalVisible = false;

      // Optionally, redirect to a different page (e.g., home)
      this.$router.push("/");
    },
    onSuccessModalClose() {
      // Close the success modal and reload the page to home
      this.successModalVisible = false;

      // Redirect to homepage after success
      this.$router.push("/"); // Use Vue Router to navigate to home
      setTimeout(() => {
        window.location.reload(); // Reload the page to update the navbar
      }, 0); // Ensure the redirect takes effect before reloading
    },
    hideFailureModal() {
      // Hide the failure modal
      this.failureModalVisible = false;
    },
  },
};
</script>
