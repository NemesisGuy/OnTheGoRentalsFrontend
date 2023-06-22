import UserList from "@/components/Admin/User/UserList.vue";
import UpdateUser from "@/components/Admin/User/UpdateUser.vue";
import CreateUser from "@/components/Admin/User/CreateUser.vue";
import DeleteUser from "@/components/Admin/User/DeleteUser.vue";
import ViewUser from "@/components/Admin/User/ViewUser.vue";
import Users from "@/components/Admin/User/UserManagement.vue";
import UserManagement from "@/components/Admin/User/UserManagement.vue";

const adminUserRoutes = [
    {
        path: 'users',
        components: {
            adminContent: UserManagement,
        },
    },
    {
        path: 'users/create',
        components: {
            adminContent: CreateUser,
        },
    },
    {
        path: 'users/update',
        components: {
            adminContent: UpdateUser,
        },
    },
    {
        path: 'users/delete',
        components: {
            adminContent: DeleteUser,
        },
    },
    {
        path: 'users/read/:id',
        name: 'ViewUser',
        components: {
            adminContent: ViewUser,
        },
    },
];

export default adminUserRoutes;
