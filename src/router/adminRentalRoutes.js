import RentalManagement from "@/components/Admin/Rental/RentalManagement.vue";
import CreateRental from "@/components/Admin/Rental/CreateRental.vue";

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





];

export default adminRentalRoutes;
