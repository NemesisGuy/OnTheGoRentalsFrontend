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
