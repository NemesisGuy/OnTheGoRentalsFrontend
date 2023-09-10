import FaqManagement from "@/components/Admin/Faq/FaqManagement.vue";
import CreateFaq from "@/components/Admin/Faq/CreateFaq.vue";
import UpdateFaq from "@/components/Admin/Faq/UpdateFaq.vue";
import DeleteFaq from "@/components/Admin/Faq/DeleteFaq.vue";
import ViewFaq from "@/components/Admin/Faq/ViewFaq.vue";

const adminFaqRoutes = [
    {
        path: 'faq',
        components: {
            adminContent: FaqManagement
        },
    },
    {
        path: 'faq/create',
        components: {
            adminContent: CreateFaq
        },
    },
    {
        path: 'faq/update/:id',
        components: {
            adminContent: UpdateFaq
        },
    },
    {
        path: 'faq/delete/:id',
        components: {
            adminContent: DeleteFaq
        },
    },
    {
        path: 'faq/view/:id',
        components: {
            adminContent: ViewFaq
        },
    },
];

export default adminFaqRoutes;