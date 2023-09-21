import Home from "@/components/Main/Home.vue";
import CarList from "@/components/Main/Car/CarList.vue";
import Login from "@/components/Main/Login.vue";
import Signup from "@/components/Main/Signup.vue";
// import Feedback from "@/components/Main/Feedback.vue";

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
    // {
    //     path: '/nav/feedback',
    //     redirect: '/'
    // },
];

export default navRoutes;
