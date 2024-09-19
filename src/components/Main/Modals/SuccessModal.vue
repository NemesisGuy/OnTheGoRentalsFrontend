<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <div class="alert-success">
        <div class="alert-success-header">
          <h1><i class="fas fa-check-circle"></i></h1>
          <h2> Success</h2>
        </div>
        <div class="alert-success-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button class="confirm-button button" @click="close">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>

</style>
