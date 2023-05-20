import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CarList from '@/components/CarList.vue';
import CustomerList from '@/components/CustomerList.vue';
import Home from "@/components/home.vue";
import ErrorPage from '@/components/ErrorPage.vue';
import Signup from "@/components/Signup.vue";
import Login from "@/components/Login.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/home',
            component: Home
        },

        {
            path: '/cars',
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
