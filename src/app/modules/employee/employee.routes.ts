import { Routes } from '@angular/router';
import { AuthGuard, EmployeeGuard } from '../../common/guards/auth.guard';
import { ROUTES } from '../../common/constants/route-paths';
import { Layout } from 'src/app/common/components/layout/layout';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard, EmployeeGuard],
    children: [
      {
        path: ROUTES.EMPLOYEE.DASHBOARD,
        loadComponent: () =>
          import('./dashboard/employee-dashboard').then(
            (m) => m.EmployeeDashboardComponent
          ),
      },
      { path: '', redirectTo: ROUTES.EMPLOYEE.DASHBOARD, pathMatch: 'full' },
    ],
  },
];