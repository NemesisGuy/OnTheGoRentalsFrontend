import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CarList from '@/components/Car/CarList.vue';
import CustomerList from '@/components/CustomerList.vue';
import Home from "@/components/Home.vue";
import ErrorPage from '@/components/ErrorPage.vue';
import Signup from "@/components/Signup.vue";
import Login from "@/components/Login.vue";
import AdminPage from "@/components/Admin/AdminPage.vue";
import CreateCar from "@/components/Admin/Car/CreateCar.vue";
import DeleteCar from "@/components/Admin/Car/DeleteCar.vue";
import UpdateCar from "@/components/Admin/Car/UpdateCar.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'HomePage',
            component: Home,
        },
        {
            path: '/home',
            name: 'Home',
            component: Home,
        },
        {
            path: '/admin',
            name: 'AdminPage',
            component: AdminPage,
        },

        {
            path: '/admin/cars/create',
            component: CreateCar,
        },
        {
            path: '/admin/cars/update',
            name: 'UpdateCar',
            component: UpdateCar,
        },
        {
            path: '/admin/cars/delete',
            name: 'DeleteCar',
            component: DeleteCar,
        },

        {
            path: '/cars/:category',
            name: 'CarList',
            component: CarList,
        },
        {
            path: '/customers',
            component: CustomerList,
        },
        {
            path: '/signup',
            component: Signup,
        },
        {
            path: '/login',
            component: Login,
        },
        {
            path: '/error',
            component: ErrorPage,
        },
        { path: '/:pathMatch(.*)*', component: ErrorPage
        }
    ]
});
export default router;
