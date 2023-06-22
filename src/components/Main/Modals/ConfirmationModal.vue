<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h2>Confirm</h2>
      <slot></slot>
      <div class="modal-actions">
        <button @click="confirmAction">Confirm</button>
        <button @click="cancelAction">Cancel</button>
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
