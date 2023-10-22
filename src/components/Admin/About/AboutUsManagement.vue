<template>
    <div class="content-container">
        <div class="content-header">
        <h1><i class="fa fa-info-circle" aria-hidden="true" ></i>
            About Us Management
        </h1>
            <router-link class="add-button button" to="/admin/aboutUs/create">
                <i class= "fa fa-info-circle"></i> Add About Details
            </router-link>
        </div>
        <table>
            <thead>
            <tr>
                <th @click="sortAboutUs('id')">ID <i class="fas fa-sort"></i></th>
                <th @click="sortAboutUs('address')">Address <i class="fas fa-sort"></i></th>
                <th @click="sortAboutUs('officeHours')">Office Hours <i class="fas fa-sort"></i></th>
                <th @click="sortAboutUs('email')">Email <i class="fas fa-sort"></i></th>
                <th @click="sortAboutUs('telephone')">Telephone Number <i class="fas fa-sort"></i></th>
                <th @click="sortAboutUs('whatsApp')">WhatsApp Number <i class="fas fa-sort"></i></th>
                <th class="actions-column">Actions</th>
            </tr>
            </thead>
            <tbody v-if="!loading">
            <tr v-for="about in sortedAbout" :key="about.id">
                <td v-if="!about.editing">{{ about.id }}</td>
                <td v-else>
                    <input v-model="about.id" disabled type="text">
                </td>

                <td v-if="!about.editing">{{ about.address }}</td>
                <td v-else>
                    <input v-model="about.address" type="text">
                </td>

                <td v-if="!about.editing">{{ about.officeHours}}</td>
                <td v-else>
                    <input v-model="about.officeHours" type="text">
                </td>

                <td v-if="!about.editing">{{ about.email }}</td>
                <td v-else>
                    <input v-model="about.email" type="text">
                </td>

                <td v-if="!about.editing">{{ about.telephone }}</td>
                <td v-else>
                    <input v-model="about.telephone" type="text">
                </td>

                <td v-if="!about.editing">{{ about.whatsApp }}</td>
                <td v-else>
                    <input v-model="about.whatsApp" type="text">
                </td>

                <td>
                    <div v-if="!about.editing">
                        <button class="delete-button button" @click="deleteAbout(about)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="update-button button" @click="editAbout(about)">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="read-button button" @click="openAboutView(about.id)">
                            <i class="fas fa-eye"></i> Read
                        </button>
                    </div>
                    <template v-else>
                        <button class="update-button button" @click="saveAbout(about)">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button class="delete-button button" @click="cancelEdit(about)">
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
            @cancel="cancelDeleteAbout"
            @confirm="confirmDeleteAbout"
        >
            <template v-if="aboutToBeDeletedId">
                <div>
                    <p>Are you sure you want to delete the following?</p>
                    <hr>
                    <p>About ID: {{ aboutToBeDeletedId.id }}</p>
                    <p>Address: {{ aboutToBeDeletedId.address }}</p>
                    <p>Email: {{ aboutToBeDeletedId.email }}</p>
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
//import {defineComponent} from "vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default{
    name: "AboutUsManagement",
    components: {LoadingModal, ConfirmationModal, SuccessModal, FailureModal},

    data() {
        return {
            about: [],
            sortedAbout: [],
            loading: false,
            showConfirmationModal: false,
            aboutToBeDeletedId: null,
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
        getAbout() {
            this.loading = true;
            const token = localStorage.getItem('token');
            console.log("token", localStorage.getItem('token'))
            axios
                .get('http://localhost:8080/api/admin/aboutUs/all', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((response) => {
                    this.users = response.data;
                    this.sortedAbout = response.data;
                    this.loading = false;
                    console.log("token", localStorage.getItem('token'))
                })
                .catch((error) => {
                    this.loading = false;
                    this.showFailureModal("Failed to fetch the details. Please try again.");
                    console.log("token", localStorage.getItem('token'))
                });
        },
        sortAboutUs(sortKey) {
            this.sortedAbout = this.sortedAbout.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) return -1;
                if (a[sortKey] > b[sortKey]) return 1;
                return 0;
            });
        },
        deleteAbout(about) {
            this.aboutToBeDeletedId = about;
            this.showConfirmationModal = true;
        },
        confirmDeleteAbout() {
            if (this.aboutToBeDeletedId) {
                const aboutId = this.aboutToBeDeletedId.id;
                this.loading = true;
                const token = localStorage.getItem('token');
                console.log("token", localStorage.getItem('token'))
                axios
                    .delete(`http://localhost:8080/api/admin/aboutUs/delete/${this.aboutToBeDeletedId.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then(() => {
                        this.showSuccessModal("About details deleted successfully.");
                        this.getAbout();
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.showFailureModal("Failed to delete the details. Please try again.");
                    });
            }
            this.aboutToBeDeletedId = null;
            this.showConfirmationModal = false;
        },
        cancelDeleteAbout() {
            this.aboutToBeDeletedId = null;
            this.showConfirmationModal = false;
        },
        editAbout(about) {
            about.editing = true;
        },
        saveAbout(about) {
            about.editing = false;
            this.loading = true;
            const token = localStorage.getItem('token');
            console.log("token", localStorage.getItem('token'))
            axios
                .put(`http://localhost:8080/api/admin/aboutUs/update/${about.id}`, about, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(() => {
                    this.showSuccessModal("About details updated successfully.");
                    this.getAbout();
                })
                .catch((error) => {
                    this.loading = false;
                    this.showFailureModal("Failed to update details. Please try again.");
                    console.log("token", localStorage.getItem('token'))
                });
        },
        cancelEdit(about) {
            about.editing = false;
        },
        openAboutView(aboutId) {
            this.$router.push(`/admin/aboutUs/read/${aboutId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
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
    created() {
        this.getAbout();
    },
};
</script>


