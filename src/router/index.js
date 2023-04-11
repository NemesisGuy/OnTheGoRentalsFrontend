import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CarList from '@/components/CarList.vue';
import CustomerList from '@/components/CustomerList.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
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
    ]
});

export default router;
