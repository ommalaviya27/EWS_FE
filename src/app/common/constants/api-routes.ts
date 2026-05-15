export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    REFRESH: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    LOGOUT: '/api/auth/logout',
  },
  PROJECT: {
    GET_ALL: '/api/projects',
    GET_BY_ID: (id: string) => `/api/projects/${id}`,
    GET_TEAM_LEADERS: '/api/projects/team-leaders',
    CREATE: '/api/projects',
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
  },
  EMPLOYEE: {
    GET_ALL:   '/api/users',
    GET_BY_ID: (id: number) => `/api/users/${id}`,
    GET_ROLES: '/api/users/roles',
    CREATE:    '/api/users',
    UPDATE:    (id: number) => `/api/users/${id}`,
    DELETE:    (id: number) => `/api/users/${id}`,
  },
};
