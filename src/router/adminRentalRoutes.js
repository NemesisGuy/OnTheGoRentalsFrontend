import RentalManagement from "@/components/Admin/Rental/RentalManagement.vue";
import CreateRental from "@/components/Admin/Rental/CreateRental.vue";
import ReadRental from "@/components/Admin/Rental/ViewRental.vue";

const adminRentalRoutes = [
    {
        path: '/admin/rentals',

        components: {
            adminContent: RentalManagement,

        }
    },

    {
        path: '/admin/rentals/create',
        name: 'CreateRental',
        components: {
            adminContent: CreateRental,
        },

    },
    {
        path: '/admin/rentals/read/:uuid',
        name: 'ViewRental',
        components: {
            adminContent: ReadRental,
        },

    },
    {
        path: '/admin/rentals/create/from-booking/:uuid?', // Or your desired path structure
        name: 'CreateRental',
        component: () => import('@/components/Admin/Rental/CreateRental.vue'), // Adjust path to your component
        props: true // This is IMPORTANT! It passes route params as props to the component
    },
    {
        path: '/admin/rentals/process-return/:uuid?',
        name: 'ProcessReturn',

        component: () => import('@/components/Admin/Rental/ProcessReturn.vue'), // Adjust path to your component
    }


];

export default adminRentalRoutes;
