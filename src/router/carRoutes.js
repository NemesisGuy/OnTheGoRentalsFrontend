import Home from "@/components/Main/General/Home.vue";
import CarList from "@/components/Main/Car/CarList.vue";
import Login from "@/components/Main/User/Login.vue";
import Signup from "@/components/Main/User/Signup.vue";

const carRoutes = [

    {
        path: '/car/var',
        name: '',
        component: CarList,
    },

];

export default carRoutes;
