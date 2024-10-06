<template>
    <div class="card-container">
        <h1>List All Details</h1>
        <table>
            <thead>
            <tr>
                <th @click="sortAboutUs('id')">ID</th>
                <th @click="sortAboutUs('address')">Address</th>
                <th @click="sortAboutUs('officeHours')">Office Hours</th>
                <th @click="sortAboutUs('email')">Email</th>
                <th @click="sortAboutUs('telephone')">Telephone Number</th>
                <th @click="sortAboutUs('whatsapp')">WhatsApp Number</th>
                <th>Delete</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="about in sortAboutUs" :key="about.id">
                <td>{{ about.id }}</td>
                <td>{{ about.address }}</td>
                <td>{{ about.officeHours }}</td>
                <td>{{ about.email }}</td>
                <td>{{ about.telephone }}</td>
                <td>{{ about.whatsapp }}</td>
                <td><button @click="deleteAbout(about.id)">Delete</button></td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
import axios from 'axios';
import api from "@/api";

export default {
    name: 'DeleteAboutUs',
    data(){
        return {
            about: [],
            sortColumn: '',
            sortDirection: '',
        };
        },
    mounted() {
        this.fetchAbout();
    },
    methods: {
        fetchAbout(){
            api()
                .get('/api/admin/aboutUs/all')
                .then((response) => {
                    this.about = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        sortAboutUs(column){
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }
        },
        deleteAbout(aboutId){
            api
                .delete(`/api/admin/aboutUs/delete/${aboutId}`)
                .then((response) => {
                    this.fetchAbout();
                    console.log(response);
                    console.log('About details deleted');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Details not deleted');
                });
        },
    },
    computed: {
        sortedAbout(){
            if (this.sortColumn && this.sortDirection) {
                return this.about.sort((a, b) => {
                    const aValue = a[this.sortColumn];
                    const bValue = b[this.sortColumn];

                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    } else {
                        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                    }
                });
            }
            return this.about;
        },
    },
};
</script>

<style>

</style>
