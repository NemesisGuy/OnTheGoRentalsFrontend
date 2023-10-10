<template>
    <div>
        <h2 class="report-header">Damage Report Details</h2>
        <div class="report-details">
            <div class="detail-item">
                <strong>Rental ID:</strong> {{ damageReport.rental.id }}
            </div>
            <div class="detail-item">
                <strong>Description:</strong> {{ damageReport.description }}
            </div>
            <div class="detail-item">
                <strong>Date and Time:</strong> {{ damageReport.dateAndTime }}
            </div>
            <div class="detail-item">
                <strong>Location:</strong> {{ damageReport.location }}
            </div>
            <div class="detail-item">
                <strong>Repair Cost:</strong> {{ damageReport.repairCost }}
            </div>
        </div>
        <button @click="goBack" class="back-button">
            <i class="fas fa-arrow-left"></i> Back
        </button>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            damageReport: {},
        };
    },
    mounted() {
        // Fetch and display the damage report details
        this.fetchDamageReport();
    },
    methods: {
        fetchDamageReport() {
            // Replace 'damageReportId' with the actual ID of the damage report you want to fetch
            const damageReportId = this.$route.params.id;

            axios
                .get(`http://localhost:8080/api/admin/damageReport/readReport/${damageReportId}`)
                .then((response) => {
                    this.damageReport = response.data;
                })
                .catch((error) => {
                    console.error("Error fetching damage report:", error);
                    // Handle the error or display an error message to the user
                });
        },
        goBack() {
            // Navigate back to the previous page or view
            this.$router.go(-1);
        },
    },
};
</script>

<style scoped>
/* Add styles for your component here */
</style>