<template>
    <div class="content-container">
        <h1>List of Cars</h1>
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Category</th>
                <th>License Plate</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="car in cars" :key="car.id">
                <td>{{ car.id }}</td>
                <td>{{ car.make }}</td>
                <td>{{ car.model }}</td>
                <td>{{ car.year }}</td>
                <td>{{ car.category }}</td>
                <td>{{ car.licensePlate }}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'CarList',
    data() {
        return {
            cars: [],
        };
    },
    mounted() {
        this.fetchCars();
    },
    methods: {
        fetchCars() {
            axios.get('http://localhost:8080/api/cars')

                .then((response) => {
                    this.cars = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
};
</script>


<style scoped>
/* Styles for the CarList component */
</style>
<style>
.car {
    border: 1px solid #5e5a5a;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #bd1b1b;
    color: #181818;
}
</style>