import { createRouter, createWebHistory } from 'vue-router';

import authApi from '@/services/auth-api';
import { RouteNames, RoutePaths } from './routes';

const routes = [
  {
    path: RoutePaths.login,
    name: RouteNames.login,
    component: () => import('@/components/LoginView.vue'),
  },

  // PROJECTS
  {
    path: RoutePaths.projects.list,
    name: RouteNames.projectsList,
    component: () => import('@/components/ProjectsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: `${RoutePaths.projects.details}/:id`,
    name: RouteNames.projectDetails,
    component: () => import('@/components/ProjectDetailsView.vue'),
    meta: { requiresAuth: true },
  },

  // CONFIGS
  {
    path: `${RoutePaths.configs.workCategories}/:type`,
    name: RouteNames.workCategories,
    component: () => import('@/components/WorkCategoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: RoutePaths.configs.indirectCosts,
    name: RouteNames.indirectCosts,
    component: () => import('@/components/IndirectCostView.vue'),
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
    authApi.clearAccessToken();
    return { name: RouteNames.login, query: { redirect: to.fullPath } };
  }

  if (to.name === RouteNames.login && isAuthenticated) {
    return { name: RouteNames.projectsList };
  }
});

export default router;
