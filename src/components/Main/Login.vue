<template xmlns="http://www.w3.org/1999/html">

    <div class="form-container">
        <form>
          <div class="form-header"> <h1> <i class="fas fa-sign-in-alt"></i> Login</h1> </div>
          <div class="form-group">
            <label for="email"><i class="fas fa-envelope"></i> Email</label>
            <input type="email" placeholder="Enter email" id="email">
          </div>
            <div class="form-group">
              <label for="password"><i class="fas fa-lock"></i> Password</label>
              <input type="password" placeholder="Enter password" id="password" autocomplete="current-password">
            </div>
            <button type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
            <button @click="goToSignup"><i class="fas fa-user-plus"></i> Signup</button>

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