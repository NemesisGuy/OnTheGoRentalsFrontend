import AdminDash from "@/components/Admin/AdminDash.vue";
import Settings from "@/components/Admin/Settings/Settings.vue";
import StaffDailyOperations from "@/components/Admin/StaffDailyOperations/StaffDailyOperations.vue";
import ActiveRentalsManagement from "@/components/Admin/Rental/ActiveRentalsManagement.vue";

const adminRoutes = [
    {
        path: '', // Default path for /admin
        name: 'AdminDash', // Optional: Give it a name for easy reference
        component: AdminDash, // Load AdminDash as default
    },
    {
        path: 'settings',
        name: 'AdminSettings',
        component: Settings,
    },
    {
        path: 'StaffDailyOperations',
        name: 'StaffDailyOperations',
        component: StaffDailyOperations,

    },
    {
        path: 'ActiveRentalsManagement',
        name: 'ActiveRentalsManagement',
        component: ActiveRentalsManagement,
    },

];

export default adminRoutes;
