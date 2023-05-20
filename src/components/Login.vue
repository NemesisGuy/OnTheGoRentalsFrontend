<template>

    <div class="form-container">
        <form>
        <h1 class="form-header">Login</h1>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" placeholder="Enter email" id="email">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" placeholder="Enter password" id="password">
            </div>
            <button type="submit">Login</button>
            <button @click="goToSignup">Signup</button>
        </form>
    </div>
</template>



<script>
export default {
    name: "Login" // this is the name of the component
    , methods: { // these are the methods that are called when the user clicks on the login button
        goToSignup() {// this is a method that is called when the user clicks on the signup button
            this.$router.push('/signup'); // this is a method that is called when the user clicks on the signup button
        }
    }, mounted() {
        console.log('Login mounted'); // this is a lifecycle hook that is called when the component is mounted
    },
    data() {
        return {
            //get the data from the form
            email: ""
            ,
            password: "" // this is the data that is passed to the backend for authentication it comes from the form
        }
    }


}

</script>

<style scoped>

</style>