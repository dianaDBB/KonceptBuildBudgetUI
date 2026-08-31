export const RouteNames = {
  login: 'login',

  // PROJECTS
  projectsList: 'projects-list',
  projectDetails: 'project-details',

  // CONFIGS
  workCategories: 'work-categories',
  indirectCosts: 'indirect-costs',
} as const;

export const RoutePaths = {
  login: '/login',

  projects: {
    list: '/project/list',
    details: '/project/details',
  },

  configs: {
    workCategories: '/configs/work-categories',
    indirectCosts: '/configs/indirect-costs',
  },
} as const;
