import AdminDash from "@/components/Admin/AdminDash.vue";
import Settings from "@/components/Admin/Settings/Settings.vue";
import StaffDailyOperations from "@/components/Admin/StaffDailyOperations/StaffDailyOperations.vue";

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
        path: "StaffDailyOperations",
        name: 'StaffDailyOperations',
        component: StaffDailyOperations,

    }
];

export default adminRoutes;
