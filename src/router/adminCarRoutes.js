import Cars from "@/components/Admin/Car/CarManagment.vue";
import CreateCar from "@/components/Admin/Car/CreateCar.vue";
import DeleteCar from "@/components/Admin/Car/DeleteCar.vue";
import UpdateCar from "@/components/Admin/Car/UpdateCar.vue";
import ViewCar from "@/components/Admin/Car/ViewCar.vue";
import AdminDash from "@/components/Admin/AdminDash.vue";
import ErrorPage from "@/components/Main/General/ErrorPage.vue";
import users from "@/components/Admin/User/UserManagement.vue";
import cars from "@/components/Admin/Car/CarManagment.vue";
import CarManagment from "@/components/Admin/Car/CarManagment.vue";

const adminCarRoutes = [
    {
        path: 'cars',
        components: {
            adminContent: CarManagment,
        },
    },
    {
        path: 'cars/create',
        components: {
            adminContent: CreateCar,
        },
    },
    {
        path: 'cars/update',
        components: {
            adminContent: UpdateCar,
        },
    },
    {
        path: 'cars/delete',
        components: {
            adminContent: DeleteCar,
        },
    },
    {
        path: 'cars/read/:id',
        name: 'ViewCar',
        components: {
            adminContent: ViewCar,
        },
    },
    {
        path: 'dashboard',
        name: 'Dashboard',
        components: { adminContent: AdminDash,
        },
    },
    {   path: '/admin/:pathMatch(.*)*',
        name: 'AdminErrorPage',
        components: { adminContent: ErrorPage }
    },


    ///////////////////////////////



];

export default adminCarRoutes;
