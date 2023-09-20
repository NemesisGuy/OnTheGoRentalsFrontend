import BookingManagement from "@/components/Admin/Booking/BookingManagement.vue";
import CreateBooking from "@/components/Admin/Booking/CreateBooking.vue";
import UpdateBooking from "@/components/Admin/Booking/UpdateBooking.vue";
import DeleteBooking from "@/components/Admin/Booking/DeleteBooking.vue";
import ViewBooking from "@/components/Admin/Booking/ViewBooking.vue";

const adminBookingRoutes = [
    {
        path: 'booking',
        components: {
            adminContent: BookingManagement
        },
    },
    {
        path: 'booking/create',
        components: {
            adminContent: CreateBooking
        },
    },
    {
        path: 'booking/update/:id',
        components: {
            adminContent: UpdateBooking
        },
    },
    {
        path: 'booking/delete/:id',
        components: {
            adminContent: DeleteBooking
        },
    },
    {
        path: 'booking/view/:id',
        components: {
            adminContent: ViewBooking
        },
    },
];

export default adminBookingRoutes;