import HelpCenterManagement from "@/components/Admin/HelpCenter/HelpCenterManagement.vue";
import CreateHelpCenter from "@/components/Admin/HelpCenter/CreateHelpCenter.vue";
import UpdateHelpCenter from "@/components/Admin/HelpCenter/UpdateHelpCenter.vue";
import DeleteHelpCenter from "@/components/Admin/HelpCenter/DeleteHelpCenter.vue";
import ViewHelpCenter from "@/components/Admin/HelpCenter/ViewHelpCenter.vue";

const adminHelpCenterRoutes = [
    {
        path: 'help-center',
        components: {
            adminContent: HelpCenterManagement
        },
    },
    {
        path: 'help-center/create',
        components: {
            adminContent: CreateHelpCenter
        },
    },
    {
        path: 'help-center/update/:id',
        components: {
            adminContent: UpdateHelpCenter
        },
    },
    {
        path: 'help-center/delete/:id',
        components: {
            adminContent: DeleteHelpCenter
        },
    },
    {
        path: 'help-center/view/:id',
        components: {
            adminContent: ViewHelpCenter
        },
    },
];

export default adminHelpCenterRoutes;