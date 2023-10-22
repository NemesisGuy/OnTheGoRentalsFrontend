<template>
    <div class="content-container">
        <div class="content-header">
            <h1><i class="fa fa-book" aria-hidden="true" ></i>
                Damage-Report Management
            </h1>

            <div class="search-bar-container">
                <div class="search-bar">
                    <div class="search-input">
                <input v-model="searchQuery" placeholder="Search..." type="text">
                        <button class="read-button button" @click="resetSearch">
                            <i class="fas fa-search"></i> Reset
                        </button>
                    </div>

            <div>
                <router-link class="add-button button" to="/admin/damageReport/create">
                    <i class="fa fa-plus" aria-hidden="true" ></i> Add Report
                </router-link>
            </div>
                </div>
            </div>
        </div>
        <table>
            <thead>
            <tr>
                <th @click="sortDamageReports('id')">ID <i class="fas fa-sort"></i></th>
                <th @click="sortDamageReports('description')">Description </th>
                <th @click="sortDamageReports('dateAndTime')">Date&Time</th>
                <th @click="sortDamageReports('location')">Location </th>
                <th @click="sortDamageReports('repairCost')">Repair Cost </th>
                <th @click="sortDamageReports('rental.rentalId')">Rental <i class="fas fa-sort"></i></th>
                <th @click="sortDamageReports('rental.receiver')">Receiver <i class="fas fa-sort"></i></th>
                <th @click="sortDamageReports('rental.issuedDate')">Date Rented <i class="fas fa-sort"></i></th>
                <th class="actions-column">Actions</th>
            </tr>
            </thead>
            <tbody>

            <tr v-for="damageReport in filteredDamageReports" :key="damageReport.id">
                <td v-if="!damageReport.editing">{{ damageReport.id  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.id " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.description  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.description " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.dateAndTime  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.dateAndTime " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.location }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.location " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.repairCost  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.repairCost " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.rental.rentalId  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.rental.rentalId " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.rental.receiver  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.rental.receiver " >
                </td>
                <td v-if="!damageReport.editing">{{ damageReport.rental.issuedDate  }}</td>
                <td v-else>
                    <input type="text" v-model="damageReport.rental.issuedDate " >
                </td>

                <td>
                    <template v-if="!damageReport.editing">
                        <button @click="editDamageReport(damageReport)" class="update-button button">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button @click="deleteDamageReport(damageReport.id)" class="delete-button button">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>

                        <button @click="openDamageReportView(damageReport.id)" class="read-button button" ><i class="fas fa-eye"></i> Read</button>
                    </template>

                    <div v-else>
                        <button @click="saveDamageReport(damageReport)" class="accept-button button">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button @click="cancelEdit(damageReport)" class="cancel-button button">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
        <div v-if="loading" class="loading">Loading...</div>
        <loading-modal v-if="loading" show></loading-modal>
        <confirmation-modal
                :show="showConfirmationModal"
                @confirm="confirmDeleteDamageReport"
                @cancel="cancelDeleteDamageReport"
        >
            <template v-if="damageReportToDelete">
                <div>
                    <p>Are you sure you want to delete this report?</p>
                    <hr>
                    <h3>Damage Report Details:</h3>
                    <p>Rental ID: {{ damageReportToDelete.rental ? damageReportToDelete.rental.id : '' }}</p>
                    <p>Description: {{ damageReportToDelete.description }}</p>
                    <p>Date and Time: {{ damageReportToDelete.dateAndTime }}</p>
                    <p>Location: {{ damageReportToDelete.location }}</p>
                    <p>Repair Cost: {{ damageReportToDelete.repairCost }}</p>
                    <hr>
                    <p><b>Warning!!!</b> This action cannot be undone.</p>
                </div>
            </template>
        </confirmation-modal>
        <SuccessModal v-if="successModal.show" @close="closeModal" @cancel="closeModal" :show="successModal.show" :message="successModal.message"></SuccessModal>
        <FailureModal v-if="failModal.show" @close="closeModal" @cancel="closeModal" :show="failModal.show" :message="failModal.message"></FailureModal>
    </div>
</template>

<script>
import axios from "axios";

import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";

export default {
    name: "DamageReportManagement",
    components: {
        ConfirmationModal,
        LoadingModal,
        SuccessModal,
        FailureModal,
    },
    data(){
        return {
            damageReport: [],
            sortedDamageReports: [],
            sortBy: null,
            searchQuery: "",
            loading: false,
            showConfirmationModal: false,
            damageReportToDelete: null,
            successModal: {
                show: false,
                message: "",
            },
            failModal: {
                show: false,
                message: "",
            },
            /* backendUrl: process.env.VUE_APP_BACKEND_URL,*/
        };
    },
    methods: {
        fetchDamageReport() {
            this.loading = true;
            const token = localStorage.getItem('token');
            console.log("token", localStorage.getItem('token'))
            axios
                .get(`http://localhost:8080/api/admin/damageReport/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((response) => {
                    this.damageReport = response.data;
                    this.sortedDamageReports = response.data;
                    this.loading = false;
                })

                .catch((error) => {
                    this.loading = false;
                    this.showFailureModal("Failed to fetch reports. Please try again.");
                    console.log("token", localStorage.getItem('token'))
                });
        },
        sortDamageReports(sortKey) {
            if (this.sortedDamageReports.length === 0) {
                return;
            }

            const currentSortKey = this.sortedDamageReports[0]._sortKey;
            let sortOrder = 'asc';

            if (currentSortKey === sortKey && this.sortedDamageReports[0]._sortOrder === 'asc') {
                sortOrder = 'desc';
            }

            this.sortedDamageReports.sort((a, b) => {
                const valueA = this.getPropertyValue(a, sortKey);
                const valueB = this.getPropertyValue(b, sortKey);

                let comparison = 0;
                if (valueA > valueB) {
                    comparison = 1;
                } else if (valueA < valueB) {
                    comparison = -1;
                }

                return sortOrder === 'asc' ? comparison : -comparison;
            });

            this.sortedDamageReports.forEach((damageReport) => {
                damageReport._sortKey = sortKey;
                damageReport._sortOrder = sortOrder;
            });
        },
        getPropertyValue(object, key) {
            const keys = key.split('.');
            let value = object;
            for (const k of keys) {
                value = value[k];
            }
            return value;
        },
        deleteDamageReport(damageReport) {
            this.damageReportToDelete = damageReport;
            this.showConfirmationModal = true;
        },
        confirmDeleteDamageReport() {
            if (this.damageReportToDelete) {
                const damageReportId = this.damageReportToDelete.id;
                this.loading = true;
                const token = localStorage.getItem('token');
                console.log("token", localStorage.getItem('token'))
                axios
                    .delete(`http://localhost:8080/api/admin/damageReport/delete/${damageReportId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then(() => {
                        this.showSuccessModal("Damage report deleted successfully.");
                        this.fetchDamageReport();
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.showFailureModal("Failed to delete the report. Please try again.");
                    });
            }
            this.damageReportToDelete = null;
            this.showConfirmationModal = false;
        },
        cancelDeleteDamageReport() {
            this.damageReportToDelete = null;
            this.showConfirmationModal = false;
        },
        editDamageReport(damageReport) {
            damageReport.editing = true;
        },
        saveDamageReport(damageReport) {
            //damageReport.id = damageReport.damageReportId;
            damageReport.description = damageReport.description;
            damageReport.dateAndTime = damageReport.dateAndTime;
            damageReport.location = damageReport.location;
            damageReport.repairCost = damageReport.repairCost;

            console.info("Saving damage report: ", damageReport);
            console.info("DamageReportId: ", damageReport.damageReportId);
            console.info("DamageReport.id: ", damageReport.id);
            damageReport.editing = false;
            this.loading = true;
            const token = localStorage.getItem('token');
            console.log("token", localStorage.getItem('token'))
            axios
                .put(`http://localhost:8080/api/admin/damageReport/update/${damageReport.id}`, damageReport, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(() => {
                    this.showSuccessModal("Report updated successfully.");
                    this.fetchDamageReport();
                })
                .catch((error) => {
                    this.loading = false;
                    this.showFailureModal("Failed to update report. Please try again.");
                });
        },
        cancelEdit(damageReport) {
            damageReport.editing = false;
        },
        openDamageReportView(damageReport) {
            this.$router.push(`/admin/damageReport/read/${damageReport}`);
        },
        resetSearch() {
            this.searchQuery = "";
            this.sortedDamageReports = this.damageReport;
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
        searchNestedProperty(obj, query) {
            for (const key in obj) {
                if (
                    typeof obj[key] === 'string' &&
                    obj[key].toLowerCase().includes(query)
                ) {
                    return true;
                }
            }
            return false;
        },
        updateSortOption(option) {
            this.sortBy = option;
        },
    },

    computed:{
        sortedDamageReports() {
            if (this.sortBy) {
                const sorted = [...this.damageReport];
                sorted.sort((a, b) => (a[this.sortBy] > b[this.sortBy] ? 1 : -1));
                return sorted;
            }
            return this.damageReport;
        },
        filteredDamageReports() {
            const query = this.searchQuery.toLowerCase();
            return this.sortedDamageReports.filter((damageReport) => {
                for (const key in damageReport) {
                    if (
                        typeof damageReport[key] === 'string' &&
                        damageReport[key].toLowerCase().includes(query)
                    ) {
                        return true;
                    }
                    // Check nested properties
                    if (
                        typeof damageReport[key] === 'object' &&
                        this.searchNestedProperty(damageReport[key], query)
                    ) {
                        return true;
                    }
                }
                return false;
            });
        },
    },

    created() {
        this.fetchDamageReport();
    },
};
</script>

<style>

</style>

