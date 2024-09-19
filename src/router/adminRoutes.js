// Purpose: Contains all routes for the admin dashboard
import AdminDash from "@/components/Admin/AdminDash.vue";
import TestPage from "@/components/Main/General/TestPage.vue";
import Settings from "@/components/Admin/Settings/Settings.vue";
import AdminView from "@/components/Admin/AdminView.vue";


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
    {
        path: '/adminview',
        name: 'AdminView',
        components: {
            adminContent: AdminView,
        }

    },



];

export default adminRoutes;
