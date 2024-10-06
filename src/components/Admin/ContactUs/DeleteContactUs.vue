<template>
    <div class="content-container">
        <div class="card-container">
            <h1>List of Queries</h1>
            <table>
                <thead>
                <tr>
                    <th @click="sortContact('id')">ID</th>
                    <th @click="sortContact('title')">Title</th>
                    <th @click="sortContact('firstName')">First Name</th>
                    <th @click="sortContact('lastName')">Last Name</th>
                    <th @click="sortContact('email')">Email</th>
                    <th @click="sortContact('subject')">Subject</th>
                    <th @click="sortContact('message')">Message</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="contact in sortedContact" :key="contact.id">
                    <td>{{ contact.id }}</td>
                    <td>{{ contact.title }}</td>
                    <td>{{ contact.firstName }}</td>
                    <td>{{ contact.lastName }}</td>
                    <td>{{ contact.email }}</td>
                    <td>{{ contact.subject }}</td>
                    <td>{{ contact.message }}</td>
                    <td><button @click="deleteContact(contact.id)">Delete</button></td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import api from "@/api";

export default {
    name: 'DeleteContact',
    data(){
        return{
            contact: [],
            sortColumn: '',
            sortDirection: '',
        };
    },
    mounted() {
        this.fetchContact();
    },
    methods: {
        fetchContact(){
            api
                .get('/api/admin/contactUs/all')
                .then((response) => {
                    this.contact = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        sortContact(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }
        },
        deleteContact(contactId) {
           api
                .delete(`/api/admin/contactUs/delete/${contactId}`)
                .then((response) => {
                    this.fetchContact();
                    console.log(response);
                    console.log('Query deleted');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Query not deleted');
                });
        },
    },
    computed: {
        sortedContact() {
            if (this.sortColumn && this.sortDirection) {
                return this.contact.sort((a, b) => {
                    const aValue = a[this.sortColumn];
                    const bValue = b[this.sortColumn];

                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    } else {
                        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                    }
                });
            }
            return this.contact;
        },
    },
};
</script>


<style>

</style>

