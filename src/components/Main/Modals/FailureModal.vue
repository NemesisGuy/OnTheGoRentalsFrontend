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
.modal-content {
  padding: 20px;
  background-color: #ffdddd;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
  border-color: #cc0000;
}

.alert-failure {
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: #ffdddd;
}

.alert-failure-header {
  color: #cc0000;
}

.alert-failure-body {
  color: black;
}

.fa-times-circle {
  color: #cc0000;
}
</style>
