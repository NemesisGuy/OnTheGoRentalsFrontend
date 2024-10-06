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
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="contact in sortedContact" :key="contact.id">
                    <td>{{ contact.id }}</td>
                    <td>
                        <input v-model="contact.title" :disabled="!contact.editMode"/>
                    </td>
                    <td>
                        <input v-model="contact.firstName" :disabled="!contact.editMode"/>
                    </td>
                    <td>
                        <input v-model="contact.lastName" :disabled="!contact.editMode"/>
                    </td>
                    <td>
                        <input v-model="contact.email" :disabled="!contact.editMode"/>
                    </td>
                    <td>
                        <input v-model="contact.subject" :disabled="!contact.editMode"/>
                    </td>
                    <td>
                        <input v-model="contact.message" :disabled="!contact.editMode"/>
                    </td>
                    <td>
                        <button class="btn-small" @click="toggleEditMode(contact)">
                            {{ contact.editMode ? 'Save' : 'Edit' }}
                        </button>
                    </td>
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
    name: 'ContactUpdate',
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
                .get(`/api/admin/contactUs/all`)
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
        toggleEditMode(contact) {
            if (contact.editMode) {
                this.updateContact(contact);
            }
            contact.editMode = !contact.editMode;
        },
        updateContact(contact) {
            api
                .put(`/api/admin/contactUs/update/${contact.id}`, contact)
                .then((response) => {
                    console.log(response);
                    console.log('Query updated');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Query not updated');
                });
        },
        },
    computed:{
        sortedContact() {
            let sortedContact = [...this.contact];

            if (this.sortColumn) {
                sortedContact.sort((a, b) => {
                    let valueA = a[this.sortColumn];
                    let valueB = b[this.sortColumn];

                    if (typeof valueA === 'string') {
                        valueA = valueA.toLowerCase();
                        valueB = valueB.toLowerCase();
                    }

                    if (valueA < valueB) {
                        return this.sortDirection === 'asc' ? -1 : 1;
                    }
                    if (valueA > valueB) {
                        return this.sortDirection === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
            }
            return sortedContact;
        },
    },
};
</script>
