import { Routes } from '@angular/router';
import { AuthGuard, EmployeeGuard } from '../../common/guards/auth.guard';
import { ROUTES } from '../../common/constants/route-paths';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
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