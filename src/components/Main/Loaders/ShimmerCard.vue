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
export default {
  name: "ShimmerCard",
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
