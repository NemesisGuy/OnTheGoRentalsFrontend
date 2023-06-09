import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CarList from '@/components/CarList.vue';
import CustomerList from '@/components/CustomerList.vue';
import Home from "@/components/Home.vue";
import ErrorPage from '@/components/ErrorPage.vue';
import Signup from "@/components/Signup.vue";
import Login from "@/components/Login.vue";
import AdminPage from "@/components/AdminPage.vue";
import createCar from "@/components/CreateCar.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Home
        },
        {
            path: '/home',
            component: Home
        },
        {
            path: '/admin',
            component: AdminPage
        },

        {
            path: '/admin/createcar',
            component: createCar
        },

        {
            path: '/cars/:category',
            name: 'CarList',
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
            path: '/login',
            component: Login
        },
        {
            path: '/error',
            component: ErrorPage
        },
        { path: '/:pathMatch(.*)*', component: ErrorPage
        }
    ]
});
export default router;
