import { createRouter, createWebHistory } from 'vue-router';
import AdminPage from "@/components/Admin/AdminPage.vue";
import adminCarRoutes from './adminCarRoutes';
import adminUserRoutes from './adminUserRoutes';
import navRoutes from './navRoutes';
import CarList from "@/components/Main/Car/CarList.vue";
import Home from "@/components/Main/General/Home.vue";
import carRoutes from './carRoutes';
import UserProfile from "@/components/Main/User/UserProfile.vue";
import adminRentalRoutes from "@/router/adminRentalRoutes";
import Rental from "@/components/Main/Rental/Rental.vue";
import ReturnRental from "@/components/Main/Rental/ReturnRental.vue";
import HelpCenter from "@/components/Main/Help/HelpCenter.vue";
import Faq from "@/components/Main/Help/Faq.vue";
import adminFaqRoutes from "@/router/adminFaqRoutes";
import adminHelpCenterRoutes from "@/router/adminHelpCenterRoutes";
import adminDriverRoutes from "@/router/adminDriverRoutes";
import Booking from "@/components/Main/Rental/Booking/Booking.vue";
import adminBookingRoutes from './adminBookingRoutes';
import AboutUs from "@/components/Main/About/AboutUs.vue";
import adminAboutUsRoutes from "@/router/adminAboutUsRoutes";
import ContactUs from "@/components/Main/About/ContactUs.vue";
import adminContactUsRoutes from "@/router/adminContactUsRoutes";
import adminDamageReportRoutes from "@/router/adminDamageReportRoutes";
import EditProfile from "@/components/Main/User/EditProfile.vue";
import Driver from "@/components/Main/Driver/DriverList.vue";
import adminRoutes from "@/router/adminRoutes";
import RentalHistory from "@/components/Main/User/RentalHistory.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...navRoutes,
        ...carRoutes,
        {
            path: '/',
            name: 'Home',
            component: Home,
        },
        {
            path: '/aboutUs/:id',
            name: 'AboutUs',
            component: AboutUs
        },
        {
            path: '/contactUs',
            name: 'ContactUs',
            component: ContactUs
        },
        {
            path: '/rental/:carId',
            name: 'Rental',
            component: Rental,
        },
        {
            path: '/rental/return/:rentalId',
            name: 'ReturnRental',
            component: ReturnRental,
        },
        {
            path: '/cars/list/:category/:available',
            name: 'CarList',
            component: CarList,
        },
        {
            path: '/user/profile/profile',
            name: 'UserProfile',
            component: UserProfile,
        },
        {
            path: '/user/profile/rental-history',
            name: 'RentalHistory',
            component: RentalHistory,
        }
        ,
        {
            path: '/booking',
            name: 'Booking',
            component: Booking,
        },
        {
            path: '/driver',
            name: 'Driver',
            component: Driver,
        },
        {
            path: '/faq',
            name: 'Faq',
            component: Faq,
        },
        {
            path: '/edit-profile',
            name: 'EditProfile',
            component: EditProfile,
        },
        {
            path: '/help-center',
            name: 'HelpCenter',
            component: HelpCenter,
        },
        {
            path: '/admin',
            component: AdminPage,
            children: [
                ...adminRoutes, // Spread the admin routes here
                ...adminCarRoutes,
                ...adminUserRoutes,
                ...adminRentalRoutes,
                ...adminBookingRoutes,
                ...adminFaqRoutes,
                ...adminHelpCenterRoutes,
                ...adminAboutUsRoutes,
                ...adminContactUsRoutes,
                ...adminDamageReportRoutes,
                ...adminDriverRoutes,

            ],
        },
        {
            path: '/error',
            component: () => import('@/components/Main/General/ErrorPage.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'ErrorPage',
            component: () => import('@/components/Main/General/ErrorPage.vue'),
        },
    ],
});

export default router;
