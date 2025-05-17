/*
import jwt_decode from 'jwt-decode';

export default {
    setup() {
        const isLoggedIn = ref(false);
        const isAdmin = ref(false);

        const checkLoginState = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwt_decode(token);
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                if (decodedToken.exp < currentTime) {
                    // Token has expired, log out the user
                    logoutUser();
                } else {
                    // Token is still valid, mark user as logged in
                    isLoggedIn.value = true;
                    checkUserRole(token);  // Fetch user role if logged in
                }
            } else {
                isLoggedIn.value = false;
            }
        };

        const checkUserRole = (token) => {
            // Fetch user profile to get roles
            api
                .get('/api/user/profile/read/profile')
                .then(response => {
                    const roles = response.data.roles || [];
                    isAdmin.value = roles.some(role => role.roleName === 'ADMIN' || role.roleName === 'SUPERADMIN');
                })
                .catch(error => {
                    console.error('Error fetching user role:', error);
                });
        };

        const logoutUser = () => {
            // Clear the token from local storage and redirect to login
            localStorage.removeItem('token');
            isLoggedIn.value = false;
            isAdmin.value = false;
            window.location.href = '/nav/user/login'; // Redirect to login page
        };

        watchEffect(() => {
            // Automatically check the login state when the component mounts
            checkLoginState();
        });

        return { isLoggedIn, isAdmin };
    }
};
*/
