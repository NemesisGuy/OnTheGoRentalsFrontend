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
import SelectCar from "@/components/Admin/Car/SelectCar.vue";
import ViewCar from "@/components/Admin/Car/ViewCar.vue";
import Users from "@/components/Admin/User/Users.vue";
import Cars from "@/components/Admin/Car/Cars.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";


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


      /*  {
            path: '/admin/cars/create',
            name: 'CreateCar',
            component: CreateCar,
        },*/
       /* {
            path: '/admin/cars/update',
            name: 'UpdateCar',
            component: UpdateCar,
        },
        {
            path: '/admin/cars/delete',
            name: 'DeleteCar',
            component: DeleteCar,
        },*/

        {
            path: '/cars/:category',
            name: 'CarList',
            component: CarList,
        },
        /*{
            path: '/admin/cars/read',
            name: 'ViewCar',
            component: ViewCar,
        },
        {
            path: '/admin/cars/select',
            name: 'SelectCar',
            component: SelectCar,
        },*/
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
            path: '/admin/users/read/:userId',
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
            path: '/admin/users/',
            name: 'Users',
            component: Users,

        },
      /*  {
            path: '/admin/cars/',
            name: 'Cars',
            component: Cars,

        },*/
        {
            path: '/admin/cars/read/:id',
            name: 'ViewCar',
            component: ViewCar,
        },
        {
            path: '/admin/cars/edit/:id',
            name: 'UpdateCar',
            component: UpdateCar,
        },

        {
            path: '/error',

            component: ErrorPage,
        },
        {   path: '/:pathMatch(.*)*',
            name: 'ErrorPage',
            component: ErrorPage,
        },

        {
            path: "/admin",
            component: AdminPage,
            children: [
                {
                    path: "cars",
                    components: {
                        adminContent: Cars, // Render CarList component in the 'adminContent' named view
                        confirmationModal: ConfirmationModal, // Render ConfirmationModal component in the 'confirmationModal' named view
                    },
                },
                {
                    path: "cars/create",
                    components: {
                        adminContent: CreateCar,
                    },
                },
                {
                    path: "cars/select",
                    components: {
                        adminContent: ViewCar,
                    },
                },
                {
                    path: "cars/update",
                    components: {
                        adminContent: UpdateCar,
                    },
                },
                {
                    path: "cars/delete",
                    components: {
                        adminContent: DeleteCar,
                    },
                },
                {
                    path: "users",
                    components: {
                        adminContent: UserList,
                    },
                },
                {
                    path: "users/create",
                    components: {
                        adminContent: CreateUser,
                    },
                },
                {
                    path: "users/select",
                    components: {
                        adminContent: ViewUser,
                    },
                },
                {
                    path: "users/update",
                    components: {
                        adminContent: UpdateUser,
                    },
                },
                {
                    path: "users/delete",
                    components: {
                        adminContent: DeleteUser,
                    },
                },
            ],
        },


    ]
});
export default router;
