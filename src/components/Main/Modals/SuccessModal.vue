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
  computed: {
    containsHTML() {
      // Simple regex to detect HTML tags in message
      const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
      return htmlTagRegex.test(this.message);
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>
