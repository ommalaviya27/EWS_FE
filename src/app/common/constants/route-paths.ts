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
    REPORTS: 'reports',
    REPORT_ABSOLUTE: '/admin/reports',
    EMPLOYEE_PERFORMANCE_REPORT_ABSOLUTE: '/admin/reports/employee-performance',
    TASK_COMPLETION_REPORT_ABSOLUTE: '/admin/reports/task-completion',
    PROJECT_PROGRESS_REPORT_ABSOLUTE: '/admin/reports/project-progress',
    ADMIN_ABSOLUTE: '/admin',
  },

  TEAM_LEAD: {
    DASHBOARD: 'dashboard',
    DASHBOARD_ABSOLUTE: '/team-lead/dashboard',
    TASK_MANAGEMENT: 'task-management',
    TASK_MANAGEMENT_ABSOLUTE: '/team-lead/task-management',
    TEAM_LEAD_ABSOLUTE: '/team-lead',
  },

  EMPLOYEE: {
    DASHBOARD: 'dashboard',
    DASHBOARD_ABSOLUTE: '/employee/dashboard',
    MY_TASKS: 'my-tasks',
    MY_TASKS_ABSOLUTE: '/employee/my-tasks',
    EMPLOYEE_ABSOLUTE: '/employee',
  },

  PROFILE: {
    PROFILE: 'profile',
    PROFILE_ABSOLUTE: '/profile',
    CHANGE_PASSWORD: 'change-password',
    CHANGE_PASSWORD_ABSOLUTE: '/profile/change-password',
  },
};