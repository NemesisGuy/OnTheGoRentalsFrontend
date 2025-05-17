
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BootstrapVueNext } from 'bootstrap-vue-next';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';


// import 'bootstrap-vue/dist/bootstrap-vue.css';
import './assets/Styles/styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import { Line } from 'vue-chartjs';
import { formatDateTime } from '@/utils/dateUtils.js'


createApp(App)
    .component('LineChart', Line )
    .use(router)
    .mount('#app');

