import CreateFeedback from "@/components/Admin/Feedback/CreateFeedback.vue";
import UpdateFeedback from "@/components/Admin/Feedback/UpdateFeedback.vue";
import DeleteFeedback from "@/components/Admin/Feedback/DeleteFeedback.vue";
import ViewFeedback from "@/components/Admin/Feedback/ViewFeedback.vue";
import FeedbackManagement from "@/components/Admin/Feedback/FeedbackManagement.vue";

const adminFeedbackRoutes = [
    {
        path: 'feedback/',
        components: {
            adminContent: FeedbackManagement
        },
    },
    {
        path: 'feedback/create',
        components: {
            adminContent: CreateFeedback
        },
    },
    {
        path: 'feedback/update/:id',
        components: {
            adminContent: UpdateFeedback
        },
    },
    {
        path: 'feedback/delete/:id',
        components: {
            adminContent: DeleteFeedback
        },
    },
    {
        path: '/admin/feedback/read/:id',
        name: 'ViewFeedback',
        components: {
            adminContent: ViewFeedback
        },
    },
];

export default adminFeedbackRoutes;
