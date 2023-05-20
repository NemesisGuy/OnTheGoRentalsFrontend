<template>
    <nav>
        <ul>
            <li><a href="#">Button 1</a></li>
            <li><a href="#">Button 2</a></li>
            <li><a  @click="openLoginForm">Login</a></li>
            <li><a  @click="openRegisterForm">Signup</a></li>


        </ul>
    </nav>
</template>

<script>
import RegisterForm from './Signup.vue';

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
nav {
    background-color: #333;
}

nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
}

nav li {
    margin: 0;
    padding: 0;
}

nav a {
    display: block;
    color: #fff;
    padding: 15px;
    text-decoration: none;
}

nav a:hover {
    background-color: #666;
}
</style>