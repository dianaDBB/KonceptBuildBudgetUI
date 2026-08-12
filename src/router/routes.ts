export const RouteNames = {
  login: 'login',
  home: 'home',
  // PROJECTS
  projectsList: 'projects-list',
  // CONFIGS
  workCategories: 'work-categories',
} as const;

export const RoutePaths = {
  login: '/login',
  home: '/',
  projects: {
    list: '/project/list',
  },
  configs: {
    workCategories: '/configs/work-categories',
  },
} as const;
