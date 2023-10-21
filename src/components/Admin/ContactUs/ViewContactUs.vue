<template>
    <div class="card-container">
    <div class="contact-profile">
        <h1>Query Details</h1>
        <div v-if="contact" class="profile-details">
            <div>
                <label>Title:</label>
                <span>{{ contact.title }}</span>
            </div>
            <div>
                <label>First Name:</label>
                <span>{{ contact.firstName }}</span>
            </div>
            <div>
                <label>Last Name:</label>
                <span>{{contact.lastName }}</span>
            </div>
            <div>
                <label>Email:</label>
                <span>{{ contact.email }}</span>
            </div>
            <div>
                <label>Subject:</label>
                <span>{{ contact.subject }}</span>
            </div>
            <div>
                <label>Message:</label>
                <span>{{ contact.message }}</span>
            </div>
        </div>
            <div v-else>
                <loading-modal v-if="loading" />
                Loading query...
            </div>

    </div>
    </div>
</template>
<script>
import axios from 'axios';
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";

export default {
    name: 'ContactProfile',
    data() {
        return {
            contact: null,
            loading: false,
        };
    },
    mounted() {
        this.fetchContact();
    },
    methods: {
        fetchContact(){
            this.loading = true;
            const contactId = this.$route.params.id;
            const token = localStorage.getItem('token');

            axios
                .get(`http://localhost:8080/api/admin/contactUs/read/${contactId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    this.contact = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
    components: {
        LoadingModal,
    },
};
</script>
<style>

</style>

