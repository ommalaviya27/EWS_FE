export const ROUTES = {
  AUTH: {
    LOGIN: {
      LOGIN: 'login',
      LOGIN_ABSOLUTE: '/auth/login',
    },
    SIGNUP: {
      SIGNUP: 'signup',
      SIGNUP_ABSOLUTE: '/auth/signup',
    },
    FORGOT_PASSWORD: {
      FORGOT_PASSWORD: 'forgot-password',
      FORGOT_PASSWORD_ABSOLUTE: '/auth/forgot-password',
    },
    RESET_PASSWORD: {
      RESET_PASSWORD: 'reset-password',
      RESET_PASSWORD_ABSOLUTE: '/auth/reset-password',
    },
  },

  ADMIN: {
    DASHBOARD: 'dashboard',
    DASHBOARD_ABSOLUTE: '/admin/dashboard',
    PROJECT: 'project',
    PROJECT_ABSOLUTE: '/admin/project',
    EMPLOYEE: 'employee',
    EMPLOYEE_ABSOLUTE: '/admin/employee',
    ADMIN_ABSOLUTE: '/admin',
  },

  TEAM_LEAD: {
    DASHBOARD: 'dashboard',
    DASHBOARD_ABSOLUTE: '/team-lead/dashboard',
    TEAM_LEAD_ABSOLUTE: '/team-lead',
  },

  EMPLOYEE: {
    DASHBOARD: 'dashboard',
    DASHBOARD_ABSOLUTE: '/employee/dashboard',
    EMPLOYEE_ABSOLUTE: '/employee',
  },
};