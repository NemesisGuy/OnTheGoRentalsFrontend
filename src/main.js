/*
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import './assets/styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';


createApp(App).use(router).mount('#app');*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import './assets/styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import { Line } from 'vue-chartjs';
/*import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';*/






createApp(App)
    .component('LineChart', Line )
/*   .component('BootstrapVue', BootstrapVue)
    .component('IconsPlugin', IconsPlugin)*/
/*    .use(BootstrapVue)*/

    .use(router)


    .mount('#app');
/*require('dotenv').config();*/
