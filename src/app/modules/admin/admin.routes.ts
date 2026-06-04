import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from '../../common/guards/auth.guard';
import { ROUTES } from '../../common/constants/route-paths';
import { Layout } from 'src/app/common/components/layout/layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: ROUTES.ADMIN.DASHBOARD,
        loadComponent: () =>
          import('./dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: ROUTES.ADMIN.PROJECT,
        loadComponent: () => import('./project/project').then((m) => m.ProjectModule),
      },
      {
        path: ROUTES.ADMIN.EMPLOYEE,
        loadComponent: () => import('./employee/employee').then((m) => m.EmployeeModule),
      },
      {
        path: ROUTES.ADMIN.REPORTS,
        children: [
          {
            path: 'employee-performance',
            loadComponent: () =>
              import(
                './reports/components/employee-performnace-report/employee-performnace-report'
              ).then((m) => m.EmployeePerformnaceReport),
          },
          { path: '', redirectTo: 'employee-performance', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: ROUTES.ADMIN.DASHBOARD, pathMatch: 'full' },
    ],
  },
];
