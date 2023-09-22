<template>
  <div class="content-container">
    <h1>Test Modals</h1>
    <button @click="showLoadingModal">Show Loading Modal</button>
    <button @click="showSuccessModal">Show Success Modal</button>
    <button @click="showFailureModal">Show Failure Modal</button>

    <button @click="showConfirmationModal">Show Confirmation Modal</button>

    <loading-modal :show="loadingModalVisible" @close="hideLoadingModal" />
    <success-modal :show="successModalVisible" @close="hideSuccessModal" message="It Worked, Nice!" />
    <failure-modal :show="failureModalVisible" @close="hideFailureModal" message="It didn't Work, Not Nice!" />

    <confirmation-modal :show="confirmationModalVisible" @confirm="confirmAction" @cancel="cancelAction">
      <!-- Slot content for the confirmation modal -->
      <p>Are you sure you want to confirm this action?</p>
    </confirmation-modal>

  </div>
</template>

<script>
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";

export default {
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  data() {
    return {
      loadingModalVisible: false,
      successModalVisible: false,
      failureModalVisible: false,
      confirmationModalVisible: false,
    };
  },
  methods: {
    showLoadingModal() {
      this.loadingModalVisible = true;
      // Wait for 5 seconds then hide modal
      setTimeout(() => {
        this.hideLoadingModal();
      }, 2000);
    },
    hideLoadingModal() {
      this.loadingModalVisible = false;
    },
    showSuccessModal() {
      this.successModalVisible = true;
    },
    hideSuccessModal() {
      this.successModalVisible = false;
    },
    showFailureModal() {
      this.failureModalVisible = true;
    },
    hideFailureModal() {
      this.failureModalVisible = false;
    },
    showConfirmationModal() {
      this.confirmationModalVisible = true;
    },
    hideConfirmationModal() {
      this.confirmationModalVisible = false;
    },
    confirmAction() {
      // Logic for confirming action
      // ...
      this.hideConfirmationModal();
    },
    cancelAction() {
      // Logic for canceling action
      // ...
      this.hideConfirmationModal();
    },
  },
};
</script>
