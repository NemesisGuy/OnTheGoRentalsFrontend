<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h1><i class="fas fa-question-circle blue-icon"> </i></h1>
      <h2>Confirm</h2>
      <slot></slot>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button class="confirm-button button" @click="confirmAction"><i class="fas fa-check"></i> Confirm</button>
        <button class="deny-button button" @click="cancelAction"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @file ConfirmationModal.vue
 * @description A reusable modal component for displaying confirmation dialogs.
 * It allows users to confirm or cancel an action. The modal's content can be customized
 * using a slot or a simple message prop.
 * @component ConfirmationModal
 * @props {boolean} show - (Required) Controls the visibility of the modal.
 * @props {string} [message] - An optional message to display within the modal.
 * @emits confirm - Emitted when the user clicks the 'Confirm' button.
 * @emits cancel - Emitted when the user clicks the 'Cancel' button.
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'ConfirmationModal',
  props: {
    /**
     * Controls the visibility of the modal.
     * @type {boolean}
     * @required
     */
    show: {
      type: Boolean,
      required: true
    },
    /**
     * An optional message to display within the modal.
     * If not provided, the parent component can inject content via the default slot.
     * @type {string}
     * @required false
     */
    message: {
      type: String,
      required: false
    }
  },
  methods: {
    /**
     * Emits the 'confirm' event when the confirm button is clicked.
     * @returns {void}
     */
    confirmAction() {
      this.$emit('confirm');
    },
    /**
     * Emits the 'cancel' event when the cancel button is clicked.
     * @returns {void}
     */
    cancelAction() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>


</style>
