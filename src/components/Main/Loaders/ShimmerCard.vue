<template>
  <div class="shimmer-card-container">
    <div class="shimmer-card">
      <div class="shimmer shimmer-title" :style="{ width: titleWidth }"></div>
      <hr />
      <div v-for="(line, index) in lines" :key="index" class="shimmer shimmer-line" :style="{ width: line }"></div>
      <hr />
      <div class="shimmer shimmer-button"></div>
    </div>
  </div>
</template>

<script>
/**
 * @file ShimmerCard.vue
 * @description A component that displays a shimmer loading animation with a card-like structure.
 * It is used as a placeholder to indicate that card content (like a title, text lines, and a button)
 * is being fetched, enhancing the user experience during loading periods.
 * The number and width of text lines, and the width of the title can be customized via props.
 * @component ShimmerCard
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "ShimmerCard",
  /**
   * Props accepted by the component.
   * @type {object}
   * @property {Array<string>} lines - An array of strings, where each string defines the width
   *                                   (e.g., '90%', '100px') of a shimmer line representing text content.
   *                                   Defaults to `['90%', '75%', '60%']`.
   * @property {string} titleWidth - The width (e.g., '40%', '150px') of the shimmer element
   *                                 representing the card's title. Defaults to '40%'.
   */
  props: {
    lines: {
      type: Array,
      default: () => ["90%", "75%", "60%"],
    },
    titleWidth: {
      type: String,
      default: "40%",
    },
  },
};
</script>

<style scoped>
.shimmer-card-container {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.shimmer-card {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.shimmer {
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
  background-size: 1000px 100%;
  border-radius: 4px;
  margin-bottom: 12px;
}

.shimmer-title {
  height: 20px;
  margin: 0 auto 20px auto;
}

.shimmer-line {
  height: 14px;
  margin: 10px auto;
}

.shimmer-button {
  height: 32px;
  width: 40%;
  margin: 0 auto;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
</style>
