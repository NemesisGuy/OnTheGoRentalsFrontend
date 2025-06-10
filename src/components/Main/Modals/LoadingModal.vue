<template>
  <div v-if="show" class="loading-modal">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
/**
 * @file LoadingModal.vue
 * @description A simple modal component that displays a loading spinner and "Loading..." text.
 * It is used to indicate to the user that an operation is in progress.
 * @component LoadingModal
 * @props {boolean} show - (Required) Controls the visibility of the modal.
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'LoadingModal',
  props: {
    /**
     * Controls the visibility of the modal.
     * When true, the modal is displayed; when false, it is hidden.
     * @type {boolean}
     * @required
     */
    show: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>


</style>
