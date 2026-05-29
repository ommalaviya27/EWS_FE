export interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
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
      { label: 'Reports', icon: 'bar_chart', route: '/admin/reports' },
    ],
  },
  2: {
    portalLabel: 'TL Portal',
    navItems: [
      { label: 'Dashboard', icon: 'dashboard', route: '/team-lead/dashboard' },
      { label: 'Projects', icon: 'assignment', route: '/team-lead/task-management' },
    ],
  },
  3: {
    portalLabel: 'Employee Portal',
    navItems: [
      { label: 'Dashboard', icon: 'dashboard', route: '/employee/dashboard' },
      { label: 'Projects', icon: 'task', route: '/employee/my-tasks' },
    ],
  },
};
