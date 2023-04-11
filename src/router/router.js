import VueRouter from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CarList from '@/components/CarList.vue';
import CustomerList from '@/components/CustomerList.vue';

const routes = [
    {
        path: '/',
        component: HomePage
    },
    {
        path: '/cars',
        component: CarList
    },
    {
        path: '/customers',
        component: CustomerList
    }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

export default router;
