export const RouteNames = {
  login: 'login',

  // PROJECTS
  projectsList: 'projects-list',
  projectDetails: 'project-details',

  // CONFIGS
  workCategories: 'work-categories',
} as const;

export const RoutePaths = {
  login: '/login',

  projects: {
    list: '/project/list',
    details: '/project/details',
  },

  configs: {
    workCategories: '/configs/work-categories',
  },
} as const;
