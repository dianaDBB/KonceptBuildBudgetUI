import { createRouter, createWebHistory } from 'vue-router';

import authApi from '@/services/auth-api';
import { RouteNames, RoutePaths } from './routes';

const routes = [
  {
    path: RoutePaths.login,
    name: RouteNames.login,
    component: () => import('@/components/LoginView.vue'),
  },
  {
    path: RoutePaths.home,
    name: RouteNames.home,
    component: () => import('@/components/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  // WORK CATEGORIES
  {
    path: RoutePaths.workCategories.list,
    name: RouteNames.workCategories,
    component: () => import('@/components/WorkCategoryView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isAuthenticated = authApi.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    void authApi.logout();
    return { name: RouteNames.login, query: { redirect: to.fullPath } };
  }

  if (to.name === RouteNames.login && isAuthenticated) {
    return { name: RouteNames.home };
  }
});

export default router;
