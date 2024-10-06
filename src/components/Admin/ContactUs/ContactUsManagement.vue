<template>
    <div class="content-container">
        <div class="content-header">
            <h1><i class="fas fa-envelope"></i>
                Contact Us Management
            </h1>
            <div class="search-bar-container">
            <div class="search-bar">
                <div class="search-input">
                    <input v-model="searchQuery" placeholder="Search..." type="text"/>
                    <button class="read-button button" @click="resetSearch">
                        <i class="fas fa-search"></i> Reset
                    </button>
                </div>
                <router-link class="add-button button" to="/admin/contactUs/create">
                    <i class="fas fa-user"></i> Add Query
                </router-link>
            </div>
        </div>
        </div>
    <table>
        <thead>
        <tr>
            <th @click="sortContact('id')">ID <i class="fas fa-sort"></i></th>
            <th @click="sortContact('title')">Title <i class="fas fa-sort"></i></th>
            <th @click="sortContact('firstName')">First Name <i class="fas fa-sort"></i></th>
            <th @click="sortContact('lastName')">Last Name <i class="fas fa-sort"></i></th>
            <th @click="sortContact('email')">Email <i class="fas fa-sort"></i></th>
            <th @click="sortContact('subject')">Subject <i class="fas fa-sort"></i></th>
            <th @click="sortContact('message')">Message <i class="fas fa-sort"></i></th>
            <th class="actions-column">Actions</th>
        </tr>
        </thead>
        <tbody v-if="!loading">
        <tr v-for="contact in sortedContact" :key="contact.id">
            <td v-if="!contact.editing">{{ contact.id }}</td>
            <td v-else>
                <input v-model="contact.id" disabled type="text">
            </td>

            <td v-if="!contact.editing">{{ contact.title }}</td>
            <td v-else>
                <input v-model="contact.title" type="text">
            </td>

            <td v-if="!contact.editing">{{ contact.firstName }}</td>
            <td v-else>
                <input v-model="contact.firstName" type="text">
            </td>

            <td v-if="!contact.editing">{{ contact.lastName }}</td>
            <td v-else>
                <input v-model="contact.lastName" type="text">
            </td>

            <td v-if="!contact.editing">{{ contact.email }}</td>
            <td v-else>
                <input v-model="contact.email" type="text">
            </td>

            <td v-if="!contact.editing">{{ contact.subject }}</td>
            <td v-else>
                <input v-model="contact.subject" type="text">
            </td>

            <td v-if="!contact.editing">{{ contact.message }}</td>
            <td v-else>
                <input v-model="contact.message" type="text">
            </td>

            <td>
                <template v-if="!contact.editing">
                    <button class="delete-button button" @click="deleteContact(contact)">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="update-button button" @click="editContact(contact)">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="read-button button" @click="openContactView(contact.id)">
                        <i class="fas fa-eye"></i> Read
                    </button>
                </template>
                <template v-else>
                    <button class="update-button button" @click="saveContact(contact)">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <button class="delete-button button" @click="cancelEdit(contact)">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </template>

            </td>
        </tr>
        </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" show></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelDeleteContact"
        @confirm="confirmDeleteContact"
    >
        <template v-if="contactToDeleteId">
            <div>
                <p>Are you sure you want to delete this query?</p>
                <hr>
                <p>ContactUs ID: {{ contactToDeleteId.id }}</p>
                <p>Title: {{ contactToDeleteId.title }}</p>
                <p>First Name: {{ contactToDeleteId.firstName }}</p>
                <p>Last Name: {{ contactToDeleteId.lastName }}</p>
                <p>Email: {{ contactToDeleteId.email }}</p>
                <hr>
                <p><b>Warning!!!</b> This action cannot be undone.</p>
            </div>
        </template>
    </confirmation-modal>
    <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show"
                  @cancel="closeModal"
                  @close="closeModal"></SuccessModal>
    <FailureModal v-if="failModal.show" :message="failModal.message" :show="failModal.show" @cancel="closeModal"
                  @close="closeModal"></FailureModal>
    </div>
</template>
<script>
import axios from "axios";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

export default {
    name: 'ContactUsManagement',
    components: {
        ConfirmationModal,
        LoadingModal,
        SuccessModal,
        FailureModal,
    },
    data() {
        return {
            contact: [],
            sortedContact: [],
            searchQuery: "",
            loading: false,
            showConfirmationModal: false,
            contactToDeleteId: null,
            successModal: {
                show: false,
                message: "",
            },
            failModal: {
                show: false,
                message: "",
            },
        };
    },
    methods: {
        getContact(){
            this.loading = true;
            const token = localStorage.getItem('token');
            console.log("token", localStorage.getItem('token'))
            api
                .get('/api/admin/contactUs/all', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((response) => {
                    this.contact = response.data;
                    this.sortedContact = response.data;
                    this.loading = false;
                    console.log("token", localStorage.getItem('token'))
                })
                .catch((error) => {
                    this.loading = false;
                    this.showFailureModal("Failed to fetch queries. Please try again.");
                    console.log("token", localStorage.getItem('token'))
                });
        },
        sortContact(sortKey) {
            this.sortedContact = this.sortedContact.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) return -1;
                if (a[sortKey] > b[sortKey]) return 1;
                return 0;
            });
        },
        deleteContact(contact) {
            this.contactToDeleteId = contact;
            this.showConfirmationModal = true;
        },
        confirmDeleteContact() {
            if (this.contactToDeleteId) {
                const contactId = this.contactToDeleteId.id;
                this.loading = true;
                const token = localStorage.getItem('token');
                console.log("token", localStorage.getItem('token'))
                api
                    .delete(`/api/admin/contactUs/delete/${this.contactToDeleteId.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then(() => {
                        this.showSuccessModal("Query deleted successfully.");
                        this.getContact();
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.showFailureModal("Failed to delete query. Please try again.");
                    });
            }
            this.contactToDeleteId = null;
            this.showConfirmationModal = false;
        },
        cancelDeleteContact() {
            this.contactToDeleteId = null;
            this.showConfirmationModal = false;
        },
        editContact(contact) {
            contact.editing = true;
        },
        saveContact(contact) {
            contact.editing = false;
            this.loading = true;
            const token = localStorage.getItem('token');
            console.log("token", localStorage.getItem('token'))
            api
                .put(`http://localhost:8080/api/admin/contactUs/update/${contact.id}`, contact, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(() => {
                    this.showSuccessModal("Query updated successfully.");
                    this.getContact();
                })
                .catch((error) => {
                    this.loading = false;
                    this.showFailureModal("Failed to update query. Please try again.");
                    console.log("token", localStorage.getItem('token'))
                });
        },
        cancelEdit(contact) {
            contact.editing = false;
        },
        openContactView(contactId) {
            this.$router.push(`/admin/contactUs/read/${contactId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        },
        resetSearch() {
            this.searchQuery = "";
            this.sortedContact = this.contact;
        },
        showSuccessModal(message) {
            this.successModal = {
                show: true,
                message: message,
            };
        },
        showFailureModal(message) {
            this.failModal = {
                show: true,
                message: message,
            };
        },
        closeModal() {
            this.successModal.show = false;
            this.failModal.show = false;
        },
    },
    computed: {
        filteredContact() {
            if (!this.searchQuery) {
                return this.sortedContact;
            }
            return this.sortedContact.filter((contact) => {
                return (
                    contact.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    contact.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    contact.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    contact.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    contact.email.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            });
        },
    },
    created() {
        this.getContact();
    },
};
</script>


