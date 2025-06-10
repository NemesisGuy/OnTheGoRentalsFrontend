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

/**
 * @file Signout.vue
 * @description A component that handles the user sign-out process.
 * Upon mounting, it immediately displays a confirmation modal to ask the user if they are sure
 * they want to sign out. If confirmed, it clears authentication data from localStorage,
 * shows a success message, and then redirects to the homepage with a page reload.
 * @component SignoutPage
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'SignoutPage', // Renamed for clarity as it acts as a page/route component
  components: {
    SuccessModal,
    FailureModal,
    ConfirmationModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {boolean} confirmationModalVisible - Controls visibility of the sign-out confirmation modal.
   * @property {boolean} successModalVisible - Controls visibility of the sign-out success modal.
   * @property {boolean} failureModalVisible - Controls visibility of the sign-out failure modal (currently not actively triggered).
   */
  data() {
    return {
      confirmationModalVisible: false,
      successModalVisible: false,
      failureModalVisible: false, // Available if a logout API call were to fail, for instance.
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * It immediately shows the sign-out confirmation modal.
   */
  mounted() {
    this.confirmationModalVisible = true;
  },
  methods: {
    /**
     * Handles the confirmation of the sign-out action.
     * Clears 'accessToken' and 'user' from localStorage, dispatches an 'auth-change' event,
     * then hides the confirmation modal and shows the success modal.
     * @returns {void}
     */
    confirmSignOut() {
      // Clear authentication tokens and user data from localStorage
      localStorage.removeItem("accessToken"); // Corrected from "token" for consistency
      localStorage.removeItem("user");        // Also remove user data

      // Dispatch an event to notify other parts of the application (e.g., Navbar) about the auth change
      window.dispatchEvent(new CustomEvent('auth-change'));

      this.confirmationModalVisible = false;
      this.successModalVisible = true;
    },
    /**
     * Handles the cancellation of the sign-out action from the confirmation modal.
     * Hides the confirmation modal and navigates the user to the homepage.
     * @returns {void}
     */
    cancelSignOut() {
      this.confirmationModalVisible = false;
      this.$router.push("/"); // Navigate to home or another appropriate page
    },
    /**
     * Handles actions after the success modal (shown after sign-out) is closed.
     * Hides the success modal, navigates to the homepage, and then reloads the window
     * to ensure a clean application state.
     * @returns {void}
     */
    onSuccessModalClose() {
      this.successModalVisible = false;
      this.$router.push("/");
      setTimeout(() => {
        window.location.reload(); // Force reload to update UI state globally (e.g., navbar)
      }, 0);
    },
    /**
     * Hides the failure modal.
     * (Note: Currently, no explicit flow in this component triggers the failure modal).
     * @returns {void}
     */
    hideFailureModal() {
      this.failureModalVisible = false;
    },
  },
};
</script>
