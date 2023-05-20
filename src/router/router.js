import VueRouter from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CarList from '@/components/CarList.vue';
import CustomerList from '@/components/CustomerList.vue';
import ErrorPageDefault from "@/components/ErrorPage.vue";
import Signup from "@/components/Signup.vue";

const routes = [
    {
        path: '/home',
        component: HomePage
    },
    {
        path: '/api/cars',
        component: CarList
    },
    {
        path: '/customers',
        component: CustomerList
    },
    {
        path: '/signup',
        component: Signup
    },
    {
        path: '/error',
        component: ErrorPageDefault
    },
    {
        path: '*',
        redirect: '/error'
    }
];

const router = new router({
    mode: 'history',
    routes
});

export default router;
