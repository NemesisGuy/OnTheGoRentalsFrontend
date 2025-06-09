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
/**
 * @file ShimmerAdminTable.vue
 * @description A component that displays a shimmer loading animation with a table-like structure.
 * It's used as a placeholder to indicate that table data is being fetched,
 * improving the perceived performance and user experience.
 * The number of rows and columns in the shimmer table can be customized via props.
 * @component ShimmerAdminTable
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "ShimmerAdminTable",
  /**
   * Props accepted by the component.
   * @type {object}
   * @property {number} rows - The number of shimmer rows to display in the table. Defaults to 8.
   * @property {number} columns - The number of shimmer columns to display in the table. Defaults to 4.
   */
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
