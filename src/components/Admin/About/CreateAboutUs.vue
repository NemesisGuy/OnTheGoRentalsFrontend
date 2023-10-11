<template>
    <div class="card-container card-container-admin">
        <div class="form-container-admin">
            <form @submit.prevent="addAbout">
                <h2 class="form-header">About Us</h2>
                <div class="form-group">
                    <label for="address">Address:</label>
                    <input id="address" v-model="about.address" placeholder="Enter address" required type="text">
                </div>
                <div class="form-group">
                    <label for="officeHours">Office Hours:</label>
                    <input id="officeHours" v-model="about.officeHours" placeholder="Enter office hours" required type="text">
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input id="email" v-model="about.email" placeholder="Enter email" required type="email">
                </div>
                <div class="form-group">
                    <label for="telephone">Telephone Number:</label>
                    <input id="telephone" v-model="about.telephone" placeholder="Enter telephone number" required type="tel">
                </div>
                <div class="form-group">
                    <label for="whatsapp">WhatsApp Number:</label>
                    <input id="whatsapp" v-model="about.whatsApp" placeholder="Enter whatsapp number" required type="tel">
                </div>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="button-container">
                    <button class="confirm-button button" type="submit"><i class="fas fa-check"></i> Save</button>
                    <button @click="goBack" class="deny-button button"><i class="fas fa-arrow-left"></i> Back </button>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import axios from "axios";

export default {
    data(){
        return{
            about:{
                address: '',
                officeHours: '',
                email: '',
                telephone: '',
                whatsApp: ''
            },
            errorMessage: ''
        };
    },
    methods:{
        addAbout(){
            this.errorMessage = '';
            axios.post("http://localhost:8080/api/admin/aboutUs/create", this.about)
                .then(response => {
                    console.log('About details have been added successfully');
                    console.log(response.data);
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                    if (error.response && error.response.status === 400) {
                        this.errorMessage = 'Invalid data. Please check the entered values.';
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response);
                    } else {
                        this.errorMessage = 'An error occurred while adding the About Us details.';
                    }
                });
            this.resetForm();
        },
        resetForm(){
            this.about = {
                address: '',
                officeHours: '',
                email: '',
                telephone: '',
                whatsApp: ''
            };
        },
        goBack() {
            this.$router.go(-1);
        }
    }
}
</script>
<style>
.error-message {
    color: red;
    margin-top: 5px;
}
</style>