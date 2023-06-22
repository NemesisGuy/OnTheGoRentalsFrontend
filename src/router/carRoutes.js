import Home from "@/components/Main/Home.vue";
import CarList from "@/components/Car/CarList.vue";
import Login from "@/components/Main/Login.vue";
import Signup from "@/components/Main/Signup.vue";

const carRoutes = [

    {
        path: '/car/var',
        name: '',
        component: CarList,
    },

];

export default carRoutes;
