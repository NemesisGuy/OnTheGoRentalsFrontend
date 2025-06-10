<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <div class="alert-success">
        <div class="alert-success-header">
          <h1><i class="fas fa-check-circle"></i></h1>
          <h2>Success</h2>
        </div>
        <div class="alert-success-body">
          <!-- Conditionally render HTML or plain text -->
          <div v-if="containsHTML" v-html="message"></div>
          <p v-else>{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button class="confirm-button button" @click="close">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @file SuccessModal.vue
 * @description A reusable modal component for displaying success messages.
 * It shows a predefined "Success" title, an icon, and a custom message.
 * The component can render the message as HTML if it detects HTML tags,
 * otherwise, it displays it as plain text.
 * @component SuccessModal
 * @props {boolean} show - (Required) Controls the visibility of the modal.
 * @props {string} message - (Required) The success message to display. Can contain HTML.
 * @emits close - Emitted when the user clicks the 'OK' button to close the modal.
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'SuccessModal',
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
     * The success message to display in the modal.
     * This message can contain HTML, which will be rendered accordingly.
     * @type {string}
     * @required
     */
    message: {
      type: String,
      required: true
    }
  },
  /**
   * Computed properties for the component.
   * @type {object}
   * @property {boolean} containsHTML - True if the `message` prop contains HTML tags, false otherwise.
   *                                    Determines if `v-html` should be used for rendering the message.
   */
  computed: {
    containsHTML() {
      // Simple regex to detect HTML tags in message
      const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
      return htmlTagRegex.test(this.message);
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
