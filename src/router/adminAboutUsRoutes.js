import AboutUsManagement from "@/components/Admin/About/AboutUsManagement.vue";
import CreateAboutUs from "@/components/Admin/About/CreateAboutUs.vue";
import UpdateAboutUs from "@/components/Admin/About/UpdateAboutUs.vue";
import DeleteAboutUs from "@/components/Admin/About/DeleteAboutUs.vue";
import ViewAboutUs from "@/components/Admin/About/ViewAboutUs.vue";


const adminAboutUsRoutes =[
    {
      path: 'aboutUs',
        components: {
          adminContent: AboutUsManagement
        },
    },
    {
        path: 'aboutUs/create',
        components: {
            adminContent: CreateAboutUs,
        },
    },
    {
        path: 'aboutUs/update',
        components: {
            adminContent: UpdateAboutUs,
        },
    },
    {
        path: 'aboutUs/delete',
        components: {
            adminContent: DeleteAboutUs,
        },
    },
    {
    path: 'aboutUs/read/:id',
    name: 'ViewAboutUs',
    components: {
    adminContent: ViewAboutUs,
},
},
];

export default adminAboutUsRoutes;