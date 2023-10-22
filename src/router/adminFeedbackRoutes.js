import Feedback from "@/components/Admin/Feedback/feedback.vue";
import CreateFeedback from "@/components/Admin/Feedback/CreateFeedback.vue";
import UpdateFeedback from "@/components/Admin/Feedback/UpdateFeedback.vue";
import DeleteFeedback from "@/components/Admin/Feedback/DeleteFeedback.vue";
import ViewFeedback from "@/components/Admin/Feedback/ViewFeedback.vue";

const adminFeedbackRoutes = [
    {
        path: '/Feedback',
        components: {
            adminContent: Feedback
        },
    },
    {
        path: '/feedback/create',
        components: {
            adminContent: CreateFeedback
        },
    },
    {
        path: '/feedback/update',
        components: {
            adminContent: UpdateFeedback
        },
    },
    {
        path: '/feedback/delete',
        components: {
            adminContent: DeleteFeedback
        },
    },
    {
        path: '/feedback/read/:id',
        name: 'ViewFeedback',
        components: {
            adminContent: ViewFeedback
        },
    },
];

export default adminFeedbackRoutes;
