import BookingManagement from "@/components/Admin/Booking/BookingManagement.vue";
import CreateBooking from "@/components/Admin/Booking/CreateBooking.vue";
import ViewBooking from "@/components/Admin/Booking/ViewBooking.vue";

const adminBookingRoutes = [
      {
        path: 'bookings',
        components: {
            adminContent: BookingManagement,
        },
    },
    {
        path: 'bookings/create',
        name: 'CreateBooking',
        components: {
            adminContent: CreateBooking,
        },
    },

    {
        path: 'bookings/read/:uuid',
        name: 'ViewBooking',
        components: {
            adminContent: ViewBooking,
        },
    },
];


 
export default adminBookingRoutes;

  