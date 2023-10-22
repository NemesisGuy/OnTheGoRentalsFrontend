<template>
    <div class="card-container">
        <h1>List All Details</h1>
        <table>
            <thead>
            <tr>
                <th @click="sortDamageReports('id')">ID ></th>
                <th @click="sortDamageReports('description')">Description </th>
                <th @click="sortDamageReports('dateAndTime')">Date&Time</th>
                <th @click="sortDamageReports('location')">Location </th>
                <th @click="sortDamageReports('repairCost')">Repair Cost </th>
                <th @click="sortDamageReports('rental.rentalId')">Rental </th>
                <th @click="sortDamageReports('rental.issuedDate')">Date Rented</th>
                <th>Delete</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="damageReport in sortDamageReports" :key="damageReport.id">
                <td>{{ damageReport.id }}</td>
                <td>{{ damageReport.rental.id }}</td>
                <td>{{ damageReport.description }}</td>
                <td>{{ damageReport.dateAndTime }}</td>
                <td>{{ damageReport.location }}</td>
                <td>{{ damageReport.repairCost }}</td>
                <td><button @click="deleteDamageReport(damageReport.id)">Delete</button></td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'DeleteDamageReport',
    data() {
        return {
            damageReport: [],
            sortColumn: '',
            sortDirection: '',
        };
    },
    mounted() {
        this.fetchDamageReport();
    },
    methods:{
        fetchDamageReport(){
            axios
                .get('http://localhost:8080/api/admin/damageReport/all')
                .then((response) => {
                    this.damageReport = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        sortDamageReports(column){
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }
        },
        deleteDamageReport(damageReportId){
            axios
                .delete(`http://localhost:8080/api/admin/damageReport/delete/${damageReportId}`)
                .then((response) => {
                    this.fetchDamageReport();
                    console.log(response);
                    console.log('Damage Report details deleted');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Details not deleted');
                });
        },
    },
    computed: {
        sortedDamageReports(){
            if (this.sortColumn && this.sortDirection) {
                return this.damageReport.sort((a, b) => {
                    const aValue = a[this.sortColumn];
                    const bValue = b[this.sortColumn];

                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    } else {
                        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                    }
                });
            }
            return this.damageReport;
        },
    },
}
</script>

