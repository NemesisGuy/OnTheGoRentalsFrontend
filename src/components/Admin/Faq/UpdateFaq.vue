<template>
<!--  <div class="content-container">-->
<!--    <div class="card-container">-->
<!--      <h1>Update FAQs</h1>-->
<!--      <h2>List of {{ category }} FAQs</h2>-->
<!--      <table>-->
<!--        <thead>-->
<!--        <tr>-->
<!--          <th @click="sortFaqs('id')">ID</th>-->
<!--          <th @click="sortFaqs('question')">Question</th>-->
<!--          <th @click="sortFaqs('answer')">Answer</th>-->
<!--          <th>Edit</th>-->
<!--          <th>Delete</th>-->
<!--        </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--        <tr v-for="faq in sortedFaqs" :key="faq.id">-->
<!--          <td>{{ faq.id }}</td>-->
<!--          <td>-->
<!--            <input v-model="faq.question" :disabled="!faq.editMode" />-->
<!--          </td>-->
<!--          <td>-->
<!--            <input v-model="faq.answer" :disabled="!faq.editMode" />-->
<!--          </td>-->
<!--          <td>-->
<!--            <button @click="toggleEditMode(faq)">-->
<!--              {{ faq.editMode ? 'Save' : 'Edit' }}-->
<!--            </button>-->
<!--          </td>-->
<!--          <td>-->
<!--            <button @click="deleteFaq(faq.id)">Delete</button>-->
<!--          </td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </table>-->
<!--    </div>-->
<!--  </div>-->
</template>

<script>
// import axios from 'axios';
//
// axios.defaults.baseURL = 'http://localhost:8080';
//
// axios.interceptors.request.use(
//     config => {
//       const token = localStorage.getItem('token');
//
//       if (token) {
//         config.headers['Authorization'] = `Bearer ${token}`;
//       }
//
//       return config;
//     },
//     error => {
//       return Promise.reject(error);
//     }
// );
//
// export default {
//   name: 'UpdateFaq',
//   data() {
//     return {
//       faqs: [],
//       category: '',
//       sortColumn: '',
//       sortDirection: '',
//     };
//   },
//   mounted() {
//     this.fetchFaqs();
//   },
//   methods: {
//     fetchFaqs() {
//       const token = localStorage.getItem('token');
//       axios
//           .get('/api/admin/faq/get-all', {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           })
//           .then((response) => {
//             this.faqs = response.data.map((faq) => ({
//               ...faq,
//               editMode: false,
//             }));
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//     },
//     sortFaqs(column) {
//       if (this.sortColumn === column) {
//         this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//       } else {
//         this.sortColumn = column;
//         this.sortDirection = 'asc';
//       }
//     },
//     deleteFaq(faqId) {
//       const token = localStorage.getItem('token');
//       axios
//           .delete(`/api/admin/faq/delete/${faqId}`, {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           })
//           .then((response) => {
//             this.fetchFaqs();
//             console.log(response);
//             console.log('FAQ deleted');
//           })
//           .catch((error) => {
//             console.log(error);
//             console.log('FAQ not deleted');
//           });
//     },
//     toggleEditMode(faq) {
//       if (faq.editMode) {
//         this.updateFaq(faq);
//       }
//       faq.editMode = !faq.editMode;
//     },
//     updateFaq(faq) {
//       const token = localStorage.getItem('token');
//       axios
//           .put(`http://localhost:8080/api/admin/faq/update/${faq.id}`, faq, {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           })
//           .then((response) => {
//             console.log(response);
//             console.log('FAQ updated');
//           })
//           .catch((error) => {
//             console.log(error);
//             console.log('FAQ not updated');
//           });
//     },
//   },
//   computed: {
//     sortedFaqs() {
//       let sortedFaqs = [...this.faqs];
//
//       if (this.sortColumn) {
//         sortedFaqs.sort((a, b) => {
//           let valueA = a[this.sortColumn];
//           let valueB = b[this.sortColumn];
//
//           if (typeof valueA === 'string') {
//             valueA = valueA.toLowerCase();
//             valueB = valueB.toLowerCase();
//           }
//
//           if (valueA < valueB) {
//             return this.sortDirection === 'asc' ? -1 : 1;
//           }
//           if (valueA > valueB) {
//             return this.sortDirection === 'asc' ? 1 : -1;
//           }
//           return 0;
//         });
//       }
//
//       return sortedFaqs;
//     },
//   },
// };
</script>

<style scoped>
</style>
