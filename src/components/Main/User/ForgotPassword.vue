<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <i class="fas fa-key header-icon"></i>
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>
      </div>

      <div v-if="message" class="alert-message" :class="isError ? 'error' : 'success'">
        {{ message }}
      </div>

      <form @submit.prevent="handleForgotPassword" v-else>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input id="email" type="email" v-model="email" placeholder="you@example.com" required />
        </div>

        <button type="submit" class="button accept-button" :disabled="isLoading">
          <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
          <span v-else>Send Reset Link</span>
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/nav/user/login">Remembered your password? Log In</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/api';

const email = ref('');
const isLoading = ref(false);
const message = ref('');
const isError = ref(false);

const handleForgotPassword = async () => {
  isLoading.value = true;
  message.value = '';
  isError.value = false;

  try {
    await api.post('/api/v1/auth/forgot-password', { email: email.value });
    // IMPORTANT: For security, we always show a success message to prevent email enumeration.
    message.value = "If an account with that email exists, a password reset link has been sent.";
  } catch (error) {
    console.error("Forgot password error:", error);
    // We can still show the generic success message here, or a subtle error.
    // Sticking to the generic success message is more secure.
    message.value = "If an account with that email exists, a password reset link has been sent.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Assuming you have a shared auth style file, or you can add styles here */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
.auth-card { background: white; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.auth-header { margin-bottom: 2rem; }
.header-icon { font-size: 3rem; color: var(--text-color-dark); margin-bottom: 1rem; }
.auth-header h2 { font-weight: 700; color: #333; }
.auth-header p { color: #666; }
.form-group { text-align: left; margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 8px; }
.auth-button { width: 100%; padding: 0.8rem; background-color: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background-color 0.2s; }
.auth-button:disabled { background-color: #ccc; }
.auth-footer { margin-top: 2rem; }
.alert-message { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
.alert-message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.alert-message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
</style>