<template>
  <div class="card-container card-container-admin">
    <div class="form-container-admin">
      <div class="content-header">
        <h1><i class="fas fa-gear"></i> Settings</h1>
      </div>

      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="currencyName">Currency Name:</label>
          <input id="currencyName" v-model="currencyName" required type="text"/>
        </div>

        <div class="form-group">
          <label for="currencySymbol">Currency Symbol:</label>
          <input id="currencySymbol" v-model="currencySymbol" required type="text"/>
        </div>
        <div class="button-container">
          <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Confirm</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';

const id = ref('');
const currencyName = ref('');
const currencySymbol = ref('');

const submitForm = async () => {
  const data = {
    id: id.value, // Add the id here
    currencyName: currencyName.value,
    currencySymbol: currencySymbol.value,
  };

  // Send a request to update the currency
  await axios.put('http://localhost:8080/api/admin/settings/update', data);
};


onMounted(async () => {
  // Fetch current settings data
  const response = await axios.get('http://localhost:8080/api/admin/settings/read');
  //id.value = response.data.id;
  id.value = response.data.id;
  currencyName.value = response.data.currencyName;
  currencySymbol.value = response.data.currencySymbol;
});
</script>
