export interface SidebarNavItem {
  label: string;
  icon: string;
  route?: string;
  children?: SidebarNavItem[];
}

export interface SidebarConfig {
  portalLabel: string;
  navItems: SidebarNavItem[];
}

export const ROLE_SIDEBAR_CONFIGS: Record<number, SidebarConfig> = {
  1: {
    portalLabel: 'Admin Portal',
    navItems: [
      { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
      { label: 'Projects', icon: 'folder', route: '/admin/project' },
      { label: 'Employees', icon: 'people', route: '/admin/employee' },
      { label: 'Attendance', icon: 'fact_check', route: '/admin/attendance' },
      { label: 'Leave Management', icon: 'event_busy', route: '/admin/dashboard' },
      {
        label: 'Reports',
        icon: 'bar_chart',
        children: [
          {
            label: 'Employee Performance',
            icon: 'leaderboard',
            route: '/admin/reports/employee-performance',
          },
          {
            label: 'Task Completion',
            icon: 'task_alt',
            route: '/admin/reports/task-completion',
          },
          {
            label: 'Project Progress',
            icon: 'rocket_launch',
            route: '/admin/reports/project-progress',
          },
        ],
      },
    ],
  },
  2: {
    portalLabel: 'TL Portal',
    navItems: [
      { label: 'Dashboard', icon: 'dashboard', route: '/team-lead/dashboard' },
      { label: 'Projects', icon: 'assignment', route: '/team-lead/task-management' },
      { label: 'Attendance', icon: 'fact_check', route: '/team-lead/attendance' },
      { label: 'Leave', icon: 'event_busy', route: '/team-lead/dashboard' },
    ],
  },
  3: {
    portalLabel: 'Employee Portal',
    navItems: [
      { label: 'Dashboard', icon: 'dashboard', route: '/employee/dashboard' },
      { label: 'Projects', icon: 'task', route: '/employee/my-tasks' },
      { label: 'Attendance', icon: 'fact_check', route: '/employee/attendance' },
      { label: 'Leave', icon: 'event_busy', route: '/employee/dashboard' },
    ],
  },
};