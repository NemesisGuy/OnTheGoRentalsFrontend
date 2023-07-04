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
        path: '/admin/rentals/read/:id',
        name: 'ReadRental',
        components:{
            adminContent : ReadRental,
        },

    },





];

export default adminRentalRoutes;
