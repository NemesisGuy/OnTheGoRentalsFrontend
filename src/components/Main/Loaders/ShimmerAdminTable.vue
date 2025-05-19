<template>
  <div class="shimmer-table-container">
    <table class="shimmer-table">
      <thead>
      <tr>
        <th v-for="n in columns" :key="n">
          <div class="shimmer shimmer-th"></div>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="row in rows" :key="row">
        <td v-for="col in columns" :key="col">
          <div class="shimmer shimmer-td"></div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "ShimmerAdminTable",
  props: {
    rows: {
      type: Number,
      default: 8,
    },
    columns: {
      type: Number,
      default: 4,
    },
  },
};
</script>

<style scoped>
.shimmer-table-container {
  width: 100%;
  overflow-x: auto;
}

.shimmer-table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  height: 30px;
}

.shimmer-th,
.shimmer-td {
  height: 16px;
  border-radius: 4px;
}

.shimmer-th {
  width: 80px;
}

.shimmer-td {
  width: 100%;
}

.shimmer {
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
  background-size: 1000px 100%;
  border-radius: 4px;
  margin-bottom: 10px;
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
