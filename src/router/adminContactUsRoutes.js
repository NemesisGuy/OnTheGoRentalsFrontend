import ContactUsManagement from "@/components/Admin/ContactUs/ContactUsManagement.vue";
import CreateContactUs from "@/components/Admin/ContactUs/CreateContactUs.vue";
import UpdateContactUs from "@/components/Admin/ContactUs/UpdateContactUs.vue";
import DeleteContactUs from "@/components/Admin/ContactUs/DeleteContactUs.vue";
import ViewContactUs from "@/components/Admin/ContactUs/ViewContactUs.vue";

const adminContactUsRoutes =[
    {
        path: 'contactUs',
        components: {
            adminContent: ContactUsManagement
        },
    },
    {
        path: 'contactUs/create',
        components: {
            adminContent: CreateContactUs
        },
    },
    {
        path: 'contactUs/update',
        components: {
            adminContent: UpdateContactUs
        },
    },
    {
        path: 'contactUs/delete',
        components: {
            adminContent: DeleteContactUs
        },
    },
    {
        path: 'contactUs/read/:id',
        name: 'ViewContactUs',
        components: {
            adminContent: ViewContactUs
        },
    },

];
export default adminContactUsRoutes;