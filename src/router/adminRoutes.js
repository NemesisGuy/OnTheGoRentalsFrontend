import Cars from "@/components/Admin/Car/CarManagment.vue";
import CreateCar from "@/components/Admin/Car/CreateCar.vue";
import DeleteCar from "@/components/Admin/Car/DeleteCar.vue";
import UpdateCar from "@/components/Admin/Car/UpdateCar.vue";
import ViewCar from "@/components/Admin/Car/ViewCar.vue";
import AdminDash from "@/components/Admin/AdminDash.vue";
import ErrorPage from "@/components/Main/ErrorPage.vue";
import users from "@/components/Admin/User/UserManagement.vue";
import cars from "@/components/Admin/Car/CarManagment.vue";
import CarManagment from "@/components/Admin/Car/CarManagment.vue";
import RentalManagement from "@/components/Admin/Rental/RentalManagement.vue";
import TestPage from "@/components/Main/TestPage.vue";
import ReturnRental from "@/components/Main/Rental/ReturnRental.vue";
import CreateRental from "@/components/Admin/Rental/CreateRental.vue";
// import Feedback from '/@components/Main/Feedback.vue';

const adminRoutes = [
    {
        path: 'admin',
        components: {
            adminContent: AdminDash,
        }
    },
    {
        path: '/admin/test',
        components: {
            adminContent: TestPage,
        }
    }



    ///////////////////////////////



];

export default adminRoutes;
