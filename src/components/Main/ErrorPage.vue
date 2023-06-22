<template>
  <div class="content-container">
    <div class="error-page">
      <h1>OnTheGoRentals</h1>
        <h2>Oops!</h2>
        <p>Something went wrong.</p>
        <p>Try again later.</p>
        <img src="../../assets/rick-roll.gif" alt="Rick Roll GIF" />
    </div>
  </div>

</template>

<style>
.error-page {
  display: flex; /* Add this line */
  flex-direction: column; /* Add this line to stack the elements vertically */
  align-items: center; /* Add this line to center the content horizontally */
  justify-content: center; /* Add this line to center the content vertically */
  background-color: #9d3a3a;
  padding: 20px;
  text-align: center;
}


h1 {
    font-size: 48px;
    margin-bottom: 20px;
}

p {
    font-size: 24px;
}

</style>
<script setup>
</script>