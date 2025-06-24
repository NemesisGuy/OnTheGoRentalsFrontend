import CarList from "@/components/Main/Car/CarList.vue";

const carRoutes = [

    {
        path: '/car/var',
        name: 'CarList',
        component: CarList,
    },
    {
        path: '/car/detail/:uuid',
        name: 'CarDetail',
        component: () => import('@/components/Main/Car/CarDetail.vue'),
        // props: true,
    },


];

export default carRoutes;
