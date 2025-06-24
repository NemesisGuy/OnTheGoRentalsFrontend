<template>
  <div class="redirect-container">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
    <h2>Finalizing Authentication...</h2>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const error = ref('');

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    error.value = 'Authentication failed: No token provided. Redirecting to login...';
    setTimeout(() => router.push('/nav/user/login'), 3000);
    return;
  }

  // Step 1: Save the access token from the URL
  localStorage.setItem('accessToken', token);

  try {
    // Step 2: Fetch the full user profile using the new token
    const response = await api.get('/api/v1/users/me/profile');
    const user = response.data.data; // Adjust based on your ApiResponseWrapper

    if (user && user.email) {
      // Step 3: Save the complete user object to localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Step 4: Dispatch the auth-change event to update the UI
      window.dispatchEvent(new CustomEvent('auth-change'));

      // Step 5: Redirect to the homepage
      router.push({ name: 'Home' });
    } else {
      throw new Error('Failed to retrieve user profile.');
    }
  } catch (err) {
    console.error('OAuth redirect handler failed:', err);
    error.value = 'Could not finalize authentication. Please try logging in again.';
    // Clean up on failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setTimeout(() => router.push('/nav/user/login'), 3000);
  }
});
</script>

<style scoped>
.redirect-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  text-align: center;
}
.loading-spinner i {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}
.error-message {
  color: #dc3545;
  margin-top: 1rem;
  font-weight: 500;
}
</style>