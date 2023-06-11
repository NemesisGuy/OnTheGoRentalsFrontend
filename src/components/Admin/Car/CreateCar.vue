<template>
  <div class="add-car-form">

    <form @submit.prevent="addCar">
      <h2 class="form-header">Add Car</h2>
      <div class="form-group">
        <label for="make">Make:</label>
        <input type="text" id="make" v-model="car.make" required>
      </div>
      <div class="form-group">
        <label for="model">Model:</label>
        <input type="text" id="model" v-model="car.model" required>
      </div>
      <div class="form-group">
        <label for="year">Year:</label>
        <input type="number" id="year" v-model="car.year" required>
      </div>
      <div class="form-group">
        <label for="category">Category:</label>
        <input type="text" id="category" v-model="car.category" required>
      </div>
      <div class="form-group">
        <label for="priceGroup">Price Group:</label>

      </div>
      <div class="form-group">
        <label for="licensePlate">License Plate:</label>
        <input type="text" id="licensePlate" v-model="car.licensePlate" required>
      </div>
      <button type="submit">Add Car</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      car: {
        /*generate a random int for the id*/

        id: '0',
        make: 'Mercedes',
        model: 'SLK 200 Kompressor',
        year: 1900,
        category: 'Sedan',
        priceGroup: '',
        licensePlate: '000000'
      }
    };
  },
  methods: {
    addCar() {
      // Generate a random ID
      this.car.id = Math.floor(Math.random() * 100000000); //max java in is 2147483647....Adjust the range as needed

      // Send the car data to the backend API or perform any other necessary actions
    //  this.car.priceGroup = PriceGroup.valueOf(car.priceGroup);
      axios.post('http://localhost:8080/api/admin/cars/create', this.car)
        .then(response => {
          // Handle success
          console.log(response);
        })
        .catch(error => {
          // Handle error
          console.log(error);
        });
      // You can access the car object using 'this.car' in this method
      console.log('Adding car:', this.car);
      // Reset the form after adding the car
      this.resetForm();
    },
    resetForm() {
      // Reset the form fields
      this.car = {
        id:'',
        make: '',
        model: '',
        year: 0,
        category: '',
        priceGroup: '',
        licensePlate: ''
      };
    }
  }
};
</script>

<style scoped>
.add-car-form {
  max-width: 400px;
  margin: auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"] {
  padding: 10px 20px;
  background-color: #6610f2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
