<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h1><i class="fas fa-question-circle blue-icon"> </i></h1>
      <h2>Confirm</h2>
      <slot></slot>
      <p>{{message}}</p>
      <div class="modal-actions">
        <button class="confirm-button button" @click="confirmAction"><i class="fas fa-check"></i> Confirm</button>
        <button class="deny-button button" @click="cancelAction"> <i class="fas fa-times"></i> Cancel</button>
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
      required: false
    }
  },
  methods: {
    confirmAction() {
      this.$emit('confirm');
    },
    cancelAction() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.modal-content{
  padding: 20px;
  background-color: #dff0d8;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
  border-color: #2b3d20;
}


</style>
