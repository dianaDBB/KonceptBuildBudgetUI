<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div>
          <h1>KonceptBuild Budget</h1>
        </div>
      </div>

      <div v-if="showLogout" class="menu-container">
        <div ref="settingsMenu" class="menu">
          <button
            class="trigger-button"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isSettingsMenuOpen"
            @click="isSettingsMenuOpen = !isSettingsMenuOpen"
          >
            <span class="trigger-span"><Settings :size="16" /></span>
          </button>

          <div v-if="isSettingsMenuOpen" class="trigger-dropdown" role="menu">
            <button
              type="button"
              class="menu-btn"
              role="menuitem"
              @click="goToWorkCategories"
              @mousedown="settingsMiddleClick($event, RoutePaths.configs.workCategories)"
            >
              <Settings :size="16" />
              Especialidades
            </button>

            <button
              type="button"
              class="menu-btn"
              role="menuitem"
              @click="goToIndirectCosts"
              @mousedown="settingsMiddleClick($event, RoutePaths.configs.indirectCosts)"
            >
              <Euro :size="16" />
              Custos Indiretos
            </button>
          </div>
        </div>

        <div ref="profileMenu" class="menu">
          <button
            class="trigger-button"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isProfileMenuOpen"
            @click="isProfileMenuOpen = !isProfileMenuOpen"
          >
            <span class="trigger-span"><User2Icon :size="16" /></span>
          </button>

          <div v-if="isProfileMenuOpen" class="trigger-dropdown" role="menu">
            <div class="profile-details">
              <div>
                <strong>{{ username }}</strong>
                <span>Signed in</span>
              </div>
            </div>
            <div class="divider"></div>
            <button type="button" class="logout-btn" role="menuitem" @click="logout">
              <LogOut :size="16" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <RouterView />
      </div>
    </main>

    <footer class="footer">
      <p>&copy; 2026 KonceptBuild</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Euro, LogOut, Settings, User2Icon } from 'lucide-vue-next';
import authApi from '@/services/auth-api';
import { RoutePaths } from './router/routes';

const route = useRoute();
const router = useRouter();

const showLogout = computed(() => route.name !== 'login' && authApi.isAuthenticated());

const username = computed(() => authApi.getUsername());
let interval: number;

const isProfileMenuOpen = ref(false);
const profileMenu = ref<HTMLElement | null>(null);

const isSettingsMenuOpen = ref(false);
const settingsMenu = ref<HTMLElement | null>(null);

onBeforeUnmount(() => {
  document.removeEventListener('click', closeProfileMenuButton);
  document.removeEventListener('keydown', closeProfileMenuEscape);

  document.removeEventListener('click', closeSettingsMenuButton);
  document.removeEventListener('keydown', closeSettingsMenuEscape);
});

onMounted(async () => {
  authApi.checkAuthentication();

  interval = window.setInterval(() => {
    authApi.checkAuthentication();
  }, 30000); // 30 seconds

  document.addEventListener('click', closeProfileMenuButton);
  document.addEventListener('keydown', closeProfileMenuEscape);

  document.addEventListener('click', closeSettingsMenuButton);
  document.addEventListener('keydown', closeSettingsMenuEscape);
});

onUnmounted(() => {
  clearInterval(interval);
});

function closeProfileMenuButton(event: MouseEvent): void {
  if (!profileMenu.value?.contains(event.target as Node)) {
    isProfileMenuOpen.value = false;
  }
}

function closeProfileMenuEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    isProfileMenuOpen.value = false;
  }
}

function closeSettingsMenuButton(event: MouseEvent): void {
  if (!settingsMenu.value?.contains(event.target as Node)) {
    isSettingsMenuOpen.value = false;
  }
}

function closeSettingsMenuEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    isSettingsMenuOpen.value = false;
  }
}

async function logout(): Promise<void> {
  isProfileMenuOpen.value = false;

  try {
    await authApi.logout();
  } finally {
    await router.replace({ name: 'login' });
  }
}

async function goToWorkCategories(): Promise<void> {
  router.push(RoutePaths.configs.workCategories);
  isSettingsMenuOpen.value = false;
}

async function goToIndirectCosts(): Promise<void> {
  router.push(RoutePaths.configs.indirectCosts);
  isSettingsMenuOpen.value = false;
}

function settingsMiddleClick(event: MouseEvent, route: string): void {
  if (event.button === 1) {
    event.preventDefault();
    const url = router.resolve(route).href;
    window.open(url, '_blank');
  }
}
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
}

.header {
  position: relative;
  background: var(--color-main-background);
  border-bottom: 1px solid var(--color-border-light);
  padding: 10px 20px;
  text-align: center;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  h1 {
    margin: 0 0 6px;
    font-size: 45px;
    font-weight: 700;
    color: var(--color-text);
  }

  p {
    margin: 0;
    font-size: 15px;
    color: var(--color-text-muted);
  }
}

.menu-container {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 12px;
}

.menu {
  position: relative;
}

.trigger-button {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: 0.2s;
}

.trigger-span {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.trigger-dropdown {
  position: absolute;
  z-index: 10;
  top: calc(100% + 10px);
  right: 0;
  width: 180px;
  padding: 8px;
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  background: var(--color-background);
  box-shadow: var(--shadow);
  text-align: left;
}

.logout-btn {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 9px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--color-danger);
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: var(--color-danger-bg);
  }
}

.menu-btn {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 9px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: var(--color-primary-light);
  }
}

.divider {
  height: 1px;
  margin: 4px 0;
  background: var(--color-background);
}

.profile-details {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;

  strong,
  span:not(.profile-avatar) {
    display: block;
  }

  strong {
    color: var(--color-text);
    font-size: 16px;
  }

  span:not(.profile-avatar) {
    margin-top: 3px;
    color: var(--color-text-muted);
    font-size: 12px;
  }
}

.main {
  flex: 1;
  padding: 20px 20px;
  overflow: hidden;
  min-height: 0;
}

.container {
  max-width: 2000px;
  margin: 0 auto;

  height: 100%;
  min-height: 0;
}

.footer {
  padding: 10px;
  text-align: center;
  background: var(--color-main-background);
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
