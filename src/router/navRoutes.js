
import Login from "@/components/Main/User/Login.vue";
import Signup from "@/components/Main/User/Signup.vue";
import SignOut from "@/components/Main/User/Signout.vue";
import AboutUs from "@/components/Main/About/AboutUs.vue";


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
        path: '/signout',
        name: 'Signout',
        component: SignOut,
    },
    {
        path: '/aboutus/latest',
        name: "AboutUs",
        component: AboutUs,
    },


];

export default navRoutes;
