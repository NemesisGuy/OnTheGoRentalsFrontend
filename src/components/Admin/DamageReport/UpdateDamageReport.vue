<template>
    <div class="content-container">
        <div class="card-container">
            <h1>Update  Damage Report</h1>
            <h1>List of Queries</h1>
            <table>
                <thead>
                <tr>
                    <th @click="sortDamageReports('id')">ID </th>
                    <th @click="sortDamageReports('description')">Description </th>
                    <th @click="sortDamageReports('dateAndTime')">Date&Time</th>
                    <th @click="sortDamageReports('location')">Location </th>
                    <th @click="sortDamageReports('repairCost')">Repair Cost </th>
                    <th @click="sortDamageReports('rental.rentalId')">Rental </th>
                    <th @click="sortDamageReports('rental.receiver')">Receiver <i class="fas fa-sort"></i></th>
                    <th @click="sortDamageReports('rental.issuedDate')">Date Rented <i class="fas fa-sort"></i></th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="damageReport in sortedDamageReports" :key="damageReport.id">
                    <td>{{ damageReport.id }}</td>
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
                        <button class="btn-small" @click="toggleEditMode(damageReport)">
                            {{ damageReport.editMode ? 'Save' : 'Edit' }}
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


export default{
    name: 'DamageReportUpdate',
    data(){
        return{
            damageReport:[],
            sortColumn: '',
            sortDirection: '',
            damageReportId: null,
        };
    },
    mounted() {
        this.fetchDamageReport()
    },
    methods: {
        fetchDamageReport(){
            axios
                .get(`http://localhost:8080/api/admin/damageReport/all`)
                .then((response) => {
                    this.damageReport = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        sortDamageReports(column) {
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
                    console.log('Damage Report deleted');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Damage Report not deleted');
                });
        },
        toggleEditMode(damageReport) {
            if (damageReport.editMode) {
                this.updateDamageReport(damageReport);
            }
            damageReport.editMode = !damageReport.editMode;
        },
        updateDamageReport(damageReport) {
            axios
                .put(`http://localhost:8080/api/admin/damageReport/update/${damageReport.id}`, damageReport)
                .then((response) => {
                    console.log(response);
                    console.log('Report updated');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Report not updated');
                });
        },
    },
    computed:{
        sortedDamageReports() {
            let sortedDamageReports = [...this.damageReport];

            if (this.sortColumn) {
                sortedDamageReports.sort((a, b) => {
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
            return sortedDamageReports;
        },
    },
}
</script>