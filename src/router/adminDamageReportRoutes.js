import DamageReportManagement from "@/components/Admin/DamageReport/DamageReportManagement.vue";
import CreateDamageReport from "@/components/Admin/DamageReport/CreateDamageReport.vue";
import ViewDamageReport from "@/components/Admin/DamageReport/ViewDamageReport.vue";
import DeleteDamageReport from "@/components/Admin/DamageReport/DeleteDamageReport.vue";
import UpdateDamageReport from "@/components/Admin/DamageReport/UpdateDamageReport.vue";

const adminDamageReportRoutes = [
    {
        path: 'damageReport',

        components: {
            adminContent: DamageReportManagement,

        }
    },
    {
        path: 'damageReport/create',
        name: 'CreateDamageReport',
        components: {
            adminContent: CreateDamageReport,
        },
    },
    {
        path: 'damageReport/read/:uuid',
        name: 'ViewDamageReport',
        components: {
            adminContent: ViewDamageReport,
        },
    },
    {
        path: 'damageReport/update/:uuid',
        name: 'UpdateDamageReport',
        components: {
            adminContent: UpdateDamageReport,
        },
    },
    {
        path: 'damageReport/delete/:uuid',
        name: 'DeleteDamageReport',
        components: {
            adminContent: DeleteDamageReport,
        },
    },
];
export default adminDamageReportRoutes;
