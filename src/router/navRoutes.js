import Home from "@/components/Main/Home.vue";
import CarList from "@/components/Car/CarList.vue";
import Login from "@/components/Main/Login.vue";
import Signup from "@/components/Main/Signup.vue";

const navRoutes = [

    {
        path: '/nav/user/login/',
        name: 'Login',
        component: Login,
    },
    {
        path: '/nav/user/logout/',
        redirect: '/'
    },
    {
        path: '/nav/user/signup/',
        name: 'Signup',
        component: Signup,
    },
    {
        path: '/nav/user/profile/',
        redirect: '/'
    },
];

export default navRoutes;
