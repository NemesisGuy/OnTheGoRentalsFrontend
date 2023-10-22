import UpdateDriver from "@/components/Admin/Driver/UpdateDriver.vue";
import CreateDriver from "@/components/Admin/Driver/CreateDriver.vue";
import DeleteDriver from "@/components/Admin/Driver/DeleteDriver.vue";
import ViewDriver from "@/components/Admin/Driver/ViewDriver.vue";
import DriverManagement from "@/components/Admin/Driver/DriverManagement.vue";

const adminDriverRoutes = [
    {
        path: 'drivers',
        components: {
            adminContent: DriverManagement,
        },
    },
    {
        path: 'drivers/create',
        components: {
            adminContent: CreateDriver,
        },
    },
    {
        path: 'drivers/update',
        components: {
            adminContent: UpdateDriver,
        },
    },
    {
        path: 'drivers/delete',
        components: {
            adminContent: DeleteDriver,
        },
    },
    {
        path: 'drivers/read/:id',
        name: 'ViewDriver',
        components: {
            adminContent: ViewDriver,
        },
    },
];

export default adminDriverRoutes;
