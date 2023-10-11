
import DamageReportManagement from "@/components/Admin/DamageReport/DamageReportManagement.vue";
import CreateDamageReport from "@/components/Admin/DamageReport/CreateDamageReport.vue";
import ViewDamageReport from "@/components/Admin/DamageReport/ViewDamageReport.vue";
import DeleteDamageReport from "@/components/Admin/DamageReport/DeleteDamageReport.vue";

const adminDamageReportRoutes = [
    {
        path: 'damageReport',

        components: {
            adminContent: DamageReportManagement,

        }
    },
    {
        path: 'damageReport/create',
        //name: 'CreateDamageReport',
        components: {
            adminContent: CreateDamageReport,
        },
    },
    {
        path: 'damageReport/read/:id',
        name: 'ViewDamageReport',
        components: {
            adminContent: ViewDamageReport,
        },
    },
    {
        path: 'damageReport/delete/:id',
        name: 'DeleteDamageReport',
        components: {
            adminContent: DeleteDamageReport,
        },
    },
];

export default adminDamageReportRoutes;
