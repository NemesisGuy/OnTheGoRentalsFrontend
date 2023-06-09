<template>
  <div className="content-container">
    <div className="sidebar">
      <ul>
        <li><router-link to="/admin/cars/create">Add Car</router-link></li>
        <li><router-link to="/admin/cars/delete">Delete Car</router-link></li>
        <li><router-link to="/admin/cars/update">Update Car</router-link></li>
        <li><a  @click="">View Car</a></li>
        <li><a  @click="">Item 5</a></li>
        <li><a  @click="">Item 6</a></li>
        <li><a  @click="">Item 7</a></li>
        <li><a  @click="">Item 8</a></li>
        <li><a  @click="">Item 9</a></li>
        <li><a  @click="">Item 10</a></li>
      </ul>
    </div>
    <div className="main-content">
      <h1>Admin Page</h1>
      <p>Nothing to see here...Yet!...</p>
      <p> Look left!! </p>
    </div>
  </div>
</template>

<style scoped>


</style>
<script setup>
</script>