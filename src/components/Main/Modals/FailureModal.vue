<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <div class="alert-failure">
        <div class="alert-failure-header">
          <h1><i class="fas fa-times-circle"></i></h1>
          <h2> Failure</h2>
        </div>
        <div class="alert-failure-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button class="deny-button button" @click="close"><i class="fas fa-exclamation-circle"></i> OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @file FailureModal.vue
 * @description A reusable modal component for displaying failure or error messages.
 * It shows a predefined "Failure" title, an icon, and a custom message.
 * @component FailureModal
 * @props {boolean} show - (Required) Controls the visibility of the modal.
 * @props {string} message - (Required) The failure or error message to display.
 * @emits close - Emitted when the user clicks the 'OK' button to close the modal.
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'FailureModal',
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
     * The failure or error message to display in the modal.
     * @type {string}
     * @required
     */
    message: {
      type: String,
      required: true
    }
  },
  methods: {
    /**
     * Emits the 'close' event when the 'OK' button is clicked.
     * @returns {void}
     */
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>

</style>
