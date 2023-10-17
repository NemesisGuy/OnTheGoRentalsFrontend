
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import 'bootstrap-vue/dist/bootstrap-vue.css';
import './assets/Styles/styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import { Line } from 'vue-chartjs';


import store from "@/store/store";


const token = localStorage.getItem('token');
if (token) {
    store.commit('setToken', token);
}

createApp(App)
    .component('LineChart', Line )
    .use(router)
    .mount('#app');

