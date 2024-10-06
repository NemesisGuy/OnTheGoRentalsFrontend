<template>
    <div class="card-container">
        <div class="form-container">
    <div class="aboutUs-details">
        <h1>AboutUs Details</h1>
        <div v-if="about" class="aboutUs-details">
            <div>
                <label>Address:</label>
                <span>{{ about.address }}</span>
            </div>
            <div>
                <label>Office Hours:</label>
                <span>{{ about.officeHours }}</span>
            </div>
            <div>
                <label>Email:</label>
                <span>{{ about.email }}</span>
            </div>
            <div>
                <label>Telephone Number:</label>
                <span>{{ about.telephone }}</span>
            </div>
            <div>
                <label>WhatsApp Number:</label>
                <span>{{ about.whatsApp }}</span>
            </div>

        </div>
    </div>
    </div>
    </div>
</template>
<script>
import axios from 'axios';
import api from "@/api";

export default {
    name: 'viewAboutUs',
    data(){
        return{
            about: null
        };
    },
    mounted() {
        this.fetchAboutUsDetails();
    },
    methods:{
        fetchAboutUsDetails(){
            const aboutId = this.$route.params.id;
            const token = localStorage.getItem('token');

            api
                .get(`/api/admin/aboutUs/read/${aboutId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    this.about = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        goBack() {
            this.$router.go(-1);
        },
    },
};
</script>
<style>
</style>