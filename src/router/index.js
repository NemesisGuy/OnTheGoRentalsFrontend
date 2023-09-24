import {createRouter, createWebHistory} from 'vue-router';
import AdminPage from "@/components/Admin/AdminPage.vue";
import adminRoutes from './adminRoutes';
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
import Booking from "@/components/Main/Rental/Booking/Booking.vue";


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
            path: '/rental/:carId',
            name: 'Rental',
            component: Rental,
        },
        {
            path: '/rental/return/:rentalId',
            name: 'ReturnRental',
            component: ReturnRental,
        },
      /*  {
            path: '/rental/create/',
            name: 'CreateRental',
            component: CreateRental,
        },*/


        {
            path: '/cars/list/:category/:available',
            name: 'CarList',
            component: CarList,
        },
        {
            path: '/user/profile/:id',
            name: 'UserProfile',
            component: UserProfile,
        },
        {
            path: '/help-center',
            name: 'HelpCenter',
            component: HelpCenter,
        },
        {
            path: '/booking',
            name: 'Booking',
            component: Booking,
        },

        {
            path: '/faq',
            name: 'Faq',
            component: Faq,
        },
        
        {
            path: '/admin',
            component: AdminPage,
            children: [
                ...adminRoutes,
                ...adminCarRoutes,
                ...adminUserRoutes,
                ...adminRentalRoutes,
                ...adminFaqRoutes,
                ...adminHelpCenterRoutes,
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
