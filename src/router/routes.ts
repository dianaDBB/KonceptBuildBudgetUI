export const RouteNames = {
  login: 'login',
  home: 'home',
  // work categories
  workCategories: 'work-categories',
} as const;

export const RoutePaths = {
  login: '/login',
  home: '/',
  workCategories: {
    list: '/configs/work-categories',
  },
} as const;
