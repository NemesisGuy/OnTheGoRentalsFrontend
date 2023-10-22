import Home from "@/components/Main/General/Home.vue";
import CarList from "@/components/Main/Car/CarList.vue";
import Login from "@/components/Main/User/Login.vue";
import Signup from "@/components/Main/User/Signup.vue";
import Feedback from "@/components/Admin/Feedback/feedback.vue";

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
    {
        path: '/nav/user/feedback/',
        name: 'Feedback',
        component: Feedback,
    },
];

export default navRoutes;
