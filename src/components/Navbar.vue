<template>
    <nav>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/cars/all">List Cars</router-link></li>
          <li><router-link to="/customers">List Customers</router-link></li>
            <li><a  @click="openLoginForm">Login</a></li>
            <li><a  @click="openRegisterForm">Signup</a></li>
        </ul>
    </nav>
</template>

<script>


export default {
    name: 'Navbar',
    methods: {
        openRegisterForm() {
            this.$router.push('/signup');

        },
        openLoginForm() {
            this.$router.push('/login');

        }

    }
}


</script>

<style>

</style>