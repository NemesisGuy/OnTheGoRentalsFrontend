// Purpose: Contains all routes for the admin dashboard
import AdminDash from "@/components/Admin/AdminDash.vue";
import TestPage from "@/components/Main/TestPage.vue";
<<<<<<< HEAD
import ReturnRental from "@/components/Main/Rental/ReturnRental.vue";
import CreateRental from "@/components/Admin/Rental/CreateRental.vue";
// import Feedback from '/@components/Main/Feedback.vue';
=======
import Settings from "@/components/Admin/Settings/Settings.vue";

>>>>>>> d803c0a8732c0314ff2fefeb1b8ac186a69eda37

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
    },
    {
        path: '/admin/settings',
        name: 'AdminSettings',
        components: {
            adminContent: Settings,
        }
    },


];

export default adminRoutes;
