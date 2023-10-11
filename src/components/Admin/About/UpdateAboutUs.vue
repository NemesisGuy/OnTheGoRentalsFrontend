<template>
    <div class="content-container">
        <div class="card-container">
            <h1>Update About Us</h1>
            <table>
                <thead>
                <tr>
                    <th @click="sortAboutUs('id')">ID</th>
                    <th @click="sortAboutUs('address')">Address</th>
                    <th @click="sortAboutUs('officeHours')">Office Hours</th>
                    <th @click="sortAboutUs('email')">Email</th>
                    <th @click="sortAboutUs('telephone')">Telephone Number</th>
                    <th @click="sortAboutUs('whatsapp')">WhatsApp Number</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="about in sortedAbout" :key="about.id">
                    <td>{{ about.id }}</td>
                    <td>
                        <input v-model="about.address" :disabled="!about.editMode"/>
                    </td>
                    <td>
                        <input v-model="about.officeHours" :disabled="!about.editMode"/>
                    </td>
                    <td>
                        <input v-model="about.email" :disabled="!about.editMode"/>
                    </td>
                    <td>
                        <input v-model="about.telephone" :disabled="!about.editMode"/>
                    </td>
                    <td>
                        <input v-model="about.whatsapp" :disabled="!about.editMode"/>
                    </td>
                    <td>
                        <button class="btn-small" @click="toggleEditMode(about)">
                            {{ about.editMode ? 'Save' : 'Edit' }}
                        </button>
                    </td>
                    <td>
                        <button class="btn-small" @click="deleteAbout(about.id)">Delete</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'AboutUpdate',
    data() {
        return {
            user: [],
            sortColumn: '',
            sortDirection: '',
        };
    },
    mounted() {
        this.fetchAbout();
    },
    methods: {
        fetchAbout() {
            axios
                .get('http://localhost:8080/api/admin/aboutUs/all')
                .then((response) => {
                    this.about = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        sortAboutUs(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }
        },
        deleteAbout(aboutId){
            axios
                .delete(`http://localhost:8080/api/admin/aboutUs/delete/${aboutId}`)
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
        toggleEditMode(about) {
            if (about.editMode) {
                this.updateAbout(about);
            }
            about.editMode = !about.editMode;
        },
        updateAbout(about) {
            axios
                .put(`http://localhost:8080/api/admin/aboutUs/update/${about.id}`, about)
                .then((response) => {
                    console.log(response);
                    console.log('About details updated');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('About details not updated');
                });
        },
    },
    computed: {
        sortedAbout(){
            let sortedAbout = [...this.users];

            if (this.sortColumn) {
                sortedAbout.sort((a, b) => {
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

            return sortedAbout;
        },
    },
};
</script>
<style>

</style>