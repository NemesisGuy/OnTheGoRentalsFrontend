<template>
  <!--  <div class="content-container">-->
  <!--    <div class="card-container">-->
  <!--      <h1>List of FAQs</h1>-->
  <!--      <table>-->
  <!--        <thead>-->
  <!--        <tr>-->
  <!--          <th @click="sortFaqs('id')">ID</th>-->
  <!--          <th @click="sortFaqs('question')">Question</th>-->
  <!--          <th @click="sortFaqs('answer')">Answer</th>-->
  <!--          <th>Delete</th>-->
  <!--        </tr>-->
  <!--        </thead>-->
  <!--        <tbody>-->
  <!--        <tr v-for="faq in sortedFaqs" :key="faq.id">-->
  <!--          <td>{{ faq.id }}</td>-->
  <!--          <td>{{ faq.question }}</td>-->
  <!--          <td>{{ faq.answer }}</td>-->
  <!--          <td><button @click="deleteFaq(faq.id)">Delete</button></td>-->
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
//   name: 'DeleteFaq',
//   data() {
//     return {
//       faqs: [],
//       sortBy: '',
//       sortDirection: '',
//     };
//   },
//   mounted() {
//     this.fetchFaqs();
//   },
//   methods: {
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
//   },
// };
</script>

<style scoped>

</style>



