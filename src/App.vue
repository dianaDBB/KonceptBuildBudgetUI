<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div>
          <h1>{{ projectHeader }}</h1>
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
              @click="goToWorkCategoriesNew"
              @auxclick.middle.prevent="openInNewTab(RoutePaths.configs.workCategories + '/NEW')"
            >
              <Settings :size="16" />
              Especialidades - Nova Construção
            </button>

            <button
              type="button"
              class="menu-btn"
              role="menuitem"
              @click="goToWorkCategoriesRenovation"
              @auxclick.middle.prevent="openInNewTab(RoutePaths.configs.workCategories + '/RENOVATION')"
            >
              <Settings :size="16" />
              Especialidades - Reabilitação
            </button>

            <button
              type="button"
              class="menu-btn"
              role="menuitem"
              @click="goToIndirectCosts"
              @auxclick.middle.prevent="openInNewTab(RoutePaths.configs.indirectCosts)"
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
        <RouterView :key="$route.fullPath" />
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
import { RouteNames, RoutePaths } from './router/routes';
import { useProjectHeader } from '@/composables/useProjectHeader';
import { useConfigs } from './composables/useConfigs';

const route = useRoute();
const router = useRouter();
const { projectHeader } = useProjectHeader();

const type = useConfigs().typeOptions;

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

async function goToWorkCategoriesNew(): Promise<void> {
  await router.push({
    name: RouteNames.workCategories,
    params: { type: type.value.NEW.code },
  });
  isSettingsMenuOpen.value = false;
}

async function goToWorkCategoriesRenovation(): Promise<void> {
  await router.push({
    name: RouteNames.workCategories,
    params: { type: type.value.RENOVATION.code },
  });
  isSettingsMenuOpen.value = false;
}

async function goToIndirectCosts(): Promise<void> {
  await router.push(RoutePaths.configs.indirectCosts);
  isSettingsMenuOpen.value = false;
}

function openInNewTab(route: string): void {
  const url = router.resolve(route).href;
  window.open(url, '_blank');
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
  z-index: 100;
  background: var(--color-main-background);
  border-bottom: 1px solid var(--color-border-light);
  padding: 4px 16px;
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
    margin: 0 0 3px;
    font-size: 32px;
    font-weight: 700;
    color: var(--color-text);
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--color-text-muted);
  }
}

.menu-container {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
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
  width: 30px;
  height: 30px;
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
  z-index: 1000;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  padding: 6px;
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
  gap: 7px;
  padding: 7px 8px;
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
  gap: 7px;
  padding: 7px 8px;
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
  gap: 8px;
  padding: 6px;

  strong,
  span:not(.profile-avatar) {
    display: block;
  }

  strong {
    color: var(--color-text);
    font-size: 14px;
  }

  span:not(.profile-avatar) {
    margin-top: 3px;
    color: var(--color-text-muted);
    font-size: 11px;
  }
}

.main {
  flex: 1;
  padding: 12px 16px;
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
  padding: 8px;
  text-align: center;
  background: var(--color-main-background);
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
