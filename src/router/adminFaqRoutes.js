import FaqManagement from "@/components/Admin/Faq/FaqManagement.vue";
import CreateFaq from "@/components/Admin/Faq/CreateFaq.vue";
import UpdateFaq from "@/components/Admin/Faq/UpdateFaq.vue";
import DeleteFaq from "@/components/Admin/Faq/DeleteFaq.vue";
import ViewFaq from "@/components/Admin/Faq/ViewFaq.vue";

const adminFaqRoutes = [
    {
        path: 'faq',
        name: 'FaqManagement',
        components: {
            adminContent: FaqManagement
        },
    },
    {
        path: 'faq/create',
        name: 'CreateFaq',
        components: {
            adminContent: CreateFaq
        },
    },
    {
        path: 'faq/update/:uuid',
        name: 'UpdateFaq',
        components: {
            adminContent: UpdateFaq
        },
    },
    {
        path: 'faq/delete/:uuid',
        name: 'DeleteFaq',
        components: {
            adminContent: DeleteFaq
        },
    },
    {
        path: 'faq/view/:uuid',
        name: 'ViewFaq',
        components: {
            adminContent: ViewFaq
        },
    },
];

export default adminFaqRoutes;