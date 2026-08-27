<template>
  <section class="login-page" data-testid="login">
    <form class="login-card" @submit.prevent="submit" data-testid="login-form">
      <div>
        <h2>Welcome back</h2>
        <p>Sign in to access KonceptBuild</p>
      </div>

      <label>
        Username
        <input v-model="username" autocomplete="username" required :disabled="isSubmitting" data-testid="username" />
      </label>

      <label>
        Password
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          :disabled="isSubmitting"
          data-testid="password"
        />
      </label>

      <p v-if="errorMessage" class="login-error" role="alert">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting" data-testid="sign-in-button">
        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/services/auth-api';
import { RoutePaths } from '@/router/routes';

const username = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const router = useRouter();

async function submit(): Promise<void> {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await authApi.login({ username: username.value, password: password.value });
    router.push(RoutePaths.projects.list);
  } catch (error: unknown) {
    errorMessage.value =
      axios.isAxiosError(error) && error.response?.status === 401
        ? 'Invalid username or password.'
        : 'Unable to sign in. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss">
.login-page {
  display: grid;
  min-height: 100%;
  place-items: center;
}

.login-card {
  display: grid;
  width: min(100%, 400px);
  gap: 20px;
  padding: 32px;
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  box-shadow: var(--shadow);

  h2 {
    margin-bottom: 6px;
    font-size: 24px;
  }

  p {
    color: var(--color-text-muted);
  }

  label {
    display: grid;
    gap: 7px;
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  button {
    padding: 11px 16px;
    border: 1px solid var(--color-primary);
    border-radius: 8px;
    background: var(--color-primary);
    color: white;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.login-error {
  color: var(--color-danger) !important;
}
</style>
