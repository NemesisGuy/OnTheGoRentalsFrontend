<template>
    <div>
        <h2 class="delete-header">Delete-Damage-Report</h2>
        <div class="delete-details">
            <p>Are you sure you want to delete this damage report?</p>
            <button @click="confirmDelete" class="delete-button">Yes, Delete</button>
            <button @click="cancelDelete" class="cancel-button">Cancel</button>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            damageReportId: null,
        };
    },
    mounted() {
        // Extract the damage report ID from the route parameters
        this.damageReportId = this.$route.params.id;
    },
    methods: {
        confirmDelete() {
            if (this.damageReportId) {
                axios
                    .delete(`http://localhost:8080/api/admin/damageReport/deleteReport/${this.damageReportId}`)
                    .then(() => {
                        console.log('Damage report deleted successfully');
                        // Optionally, you can navigate to a different page or view
                        // this.$router.push('/some-other-page');
                    })
                    .catch((error) => {
                        console.error('Error deleting damage report:', error);
                        // Handle the error or display an error message to the user
                    });
            }
        },
        cancelDelete() {
            // Navigate back to the previous page or view
            this.$router.go(-1);
        },
    },
};
</script>

<style scoped>
/* Add styles for your component here */
</style>

