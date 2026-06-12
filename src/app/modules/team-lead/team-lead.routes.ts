import { Routes } from '@angular/router';
import { AuthGuard, TeamLeadGuard } from '../../common/guards/auth.guard';
import { ROUTES } from '../../common/constants/route-paths';
import { Layout } from 'src/app/common/components/layout/layout';

export const TEAM_LEAD_ROUTES: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard, TeamLeadGuard],
    children: [
      {
        path: ROUTES.TEAM_LEAD.DASHBOARD,
        loadComponent: () =>
          import('./dashboard/team-lead-dashboard').then(
            (m) => m.TeamLeadDashboardComponent
          ),
      },
      {
        path: ROUTES.TEAM_LEAD.TASK_MANAGEMENT,
        loadComponent: () =>
          import('./task-management/task-management').then(
            (m) => m.TaskManagement
          ),
      },
      {
        path: ROUTES.TEAM_LEAD.ATTENDANCE,
        loadComponent: () =>
          import('./attendance/team-lead-attendance').then(
            (m) => m.TeamLeadAttendance
          ),
      },
      { path: '', redirectTo: ROUTES.TEAM_LEAD.DASHBOARD, pathMatch: 'full' },
    ],
  },
];