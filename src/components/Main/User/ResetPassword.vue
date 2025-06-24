<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <i class="fas fa-lock header-icon"></i>
        <h2>Reset Your Password</h2>
        <p>Please enter your new password below.</p>
      </div>

      <div v-if="message" class="alert-message" :class="isError ? 'error' : 'success'">
        {{ message }}
      </div>

      <form @submit.prevent="handleResetPassword" v-if="!isSuccess">
        <div class="form-group">
          <label for="password">New Password</label>
          <input id="password" type="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" type="password" v-model="confirmPassword" required />
          <p v-if="passwordsMismatch" class="error-text">Passwords do not match.</p>
        </div>

        <button type="submit" class="button accept-button" :disabled="isLoading || passwordsMismatch || !token">
          <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Resetting...</span>
          <span v-else>Reset Password</span>
        </button>
      </form>

      <div class="auth-footer" v-if="isSuccess">
        <router-link to="/nav/user/login">Proceed to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const route = useRoute();
const router = useRouter();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');

const isLoading = ref(false);
const message = ref('');
const isError = ref(false);
const isSuccess = ref(false);

const passwordsMismatch = computed(() => {
  return password.value && confirmPassword.value && password.value !== confirmPassword.value;
});

onMounted(() => {
  token.value = route.query.token || '';
  if (!token.value) {
    isError.value = true;
    message.value = 'Invalid or missing password reset token. Please request a new link.';
  }
});

const handleResetPassword = async () => {
  if (passwordsMismatch.value || !token.value) return;

  isLoading.value = true;
  message.value = '';
  isError.value = false;
  isSuccess.value = false;

  try {
    await api.post('/api/v1/auth/reset-password', {
      token: token.value,
      newPassword: password.value,
    });
    message.value = 'Your password has been reset successfully!';
    isSuccess.value = true;

  } catch (error) {
    console.error("Reset password error:", error);
    isError.value = true;
    message.value = error.response?.data?.errors?.[0]?.message || 'Failed to reset password. The link may have expired or is invalid.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Re-using the same styles from ForgotPassword.vue is efficient */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh;  padding: 2rem; }
.auth-card { background: white; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.auth-header { margin-bottom: 2rem; }
.header-icon { font-size: 3rem; color: var(--text-color-dark); margin-bottom: 1rem; }
.auth-header h2 { font-weight: 700; color: #333; }
.auth-header p { color: #666; }
.form-group { text-align: left; margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
.auth-button { width: 100%; padding: 0.8rem; background-color: #007bff; color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background-color 0.2s; }
.auth-button:disabled { background-color: #ccc; cursor: not-allowed; }
.auth-footer { margin-top: 2rem; }
.auth-footer a { color: var(--text-color-link); text-decoration: none; }
.error-text { color: #dc3545; font-size: 0.9rem; margin-top: 0.5rem; }
.alert-message { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; }
.alert-message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert-message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
</style>