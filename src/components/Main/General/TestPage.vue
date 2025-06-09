<template>
  <div class="content-container">
    <h1>Test Modals</h1>
    <button @click="showLoadingModal" class="read-button button">Show Loading Modal</button>
    <br>
    <button @click="showSuccessModal " class="accept-button button">Show Success Modal</button>
    <br>
    <button @click="showFailureModal" class="deny-button button">Show Failure Modal</button>
    <br>
    <button @click="showConfirmationModal" class="update-button button">Show Confirmation Modal</button>

    <loading-modal :show="loadingModalVisible" @close="hideLoadingModal"/>
    <success-modal :show="successModalVisible" @close="hideSuccessModal" message="It Worked, Nice!"/>
    <failure-modal :show="failureModalVisible" @close="hideFailureModal" message="It didn't Work, Not Nice!"/>

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

/**
 * @file TestPage.vue
 * @description A component used for testing various modal dialogs (Loading, Success, Failure, Confirmation).
 * It provides buttons to trigger each type of modal and demonstrates their basic usage and event handling.
 * @component TestPage
 */
export default {
  /**
   * Components registered for use within this component.
   * @type {object}
   * @property {Component} LoadingModal - Modal for indicating loading states.
   * @property {Component} SuccessModal - Modal for displaying success messages.
   * @property {Component} FailureModal - Modal for displaying failure or error messages.
   * @property {Component} ConfirmationModal - Modal for asking user confirmation for an action.
   */
  components: {
    LoadingModal,
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {boolean} loadingModalVisible - Controls the visibility of the LoadingModal.
   * @property {boolean} successModalVisible - Controls the visibility of the SuccessModal.
   * @property {boolean} failureModalVisible - Controls the visibility of the FailureModal.
   * @property {boolean} confirmationModalVisible - Controls the visibility of the ConfirmationModal.
   */
  data() {
    return {
      loadingModalVisible: false,
      successModalVisible: false,
      failureModalVisible: false,
      confirmationModalVisible: false,
    };
  },
  methods: {
    /**
     * Shows the loading modal.
     * It also sets a timeout to automatically hide the modal after 2 seconds.
     * @returns {void}
     */
    showLoadingModal() {
      this.loadingModalVisible = true;
      // Wait for 2 seconds then hide modal
      setTimeout(() => {
        this.hideLoadingModal();
      }, 2000);
    },
    /**
     * Hides the loading modal.
     * @returns {void}
     */
    hideLoadingModal() {
      this.loadingModalVisible = false;
    },
    /**
     * Shows the success modal.
     * @returns {void}
     */
    showSuccessModal() {
      this.successModalVisible = true;
    },
    /**
     * Hides the success modal.
     * @returns {void}
     */
    hideSuccessModal() {
      this.successModalVisible = false;
    },
    /**
     * Shows the failure modal.
     * @returns {void}
     */
    showFailureModal() {
      this.failureModalVisible = true;
    },
    /**
     * Hides the failure modal.
     * @returns {void}
     */
    hideFailureModal() {
      this.failureModalVisible = false;
    },
    /**
     * Shows the confirmation modal.
     * @returns {void}
     */
    showConfirmationModal() {
      this.confirmationModalVisible = true;
    },
    /**
     * Hides the confirmation modal.
     * @returns {void}
     */
    hideConfirmationModal() {
      this.confirmationModalVisible = false;
    },
    /**
     * Placeholder method for handling the 'confirm' action from the confirmation modal.
     * Currently, it only hides the modal.
     * @returns {void}
     */
    confirmAction() {
      // Logic for confirming action
      console.log("Action confirmed from TestPage.");
      this.hideConfirmationModal();
    },
    /**
     * Placeholder method for handling the 'cancel' action from the confirmation modal.
     * Currently, it only hides the modal.
     * @returns {void}
     */
    cancelAction() {
      // Logic for canceling action
      console.log("Action canceled from TestPage.");
      this.hideConfirmationModal();
    },
  },
};
</script>
