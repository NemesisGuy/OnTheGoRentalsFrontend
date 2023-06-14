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
import UserList from "@/components/Admin/User/UserList.vue";
import UpdateUser from "@/components/Admin/User/UpdateUser.vue";
import CreateUser from "@/components/Admin/User/CreateUser.vue";
import DeleteUser from "@/components/Admin/User/DeleteUser.vue";
import ViewUser from "@/components/Admin/User/ViewUser.vue";
import SelectUser from "@/components/Admin/User/SelectUser.vue";


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
            name: 'CreateCar',
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
            name: 'CustomerList',
            component: CustomerList,
        },
        {
            path: '/signup',
            name: 'Signup',
            component: Signup,
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
        },
        {
            path: '/admin/users/create',
            name: 'CreateUser',
            component: CreateUser,
        },
        {
            path: '/admin/users/read',
            name: 'ViewUser',
            component: ViewUser,
        },
        {
            path: '/admin/users/select',
            name: 'SelectUser',
            component: SelectUser,
        },
        {
            path: '/admin/users/:category',
            name: 'UserList',
            component: UserList,
        },
        {
            path: '/admin/users/update',
            name: 'UpdateUser',
            component: UpdateUser,
        },
        {
            path: '/admin/users/delete',
            name: 'DeleteUser',
            component: DeleteUser,
        },
        {
            path: '/error',

            component: ErrorPage,
        },
        {   path: '/:pathMatch(.*)*',
            name: 'ErrorPage',
            component: ErrorPage,
        }
    ]
});
export default router;
