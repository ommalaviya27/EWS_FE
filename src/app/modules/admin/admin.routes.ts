import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from '../../common/guards/auth.guard';
import { ROUTES } from '../../common/constants/route-paths';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: ROUTES.ADMIN.DASHBOARD,
        loadComponent: () =>
          import('./dashboard/admin-dashboard').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      { path: '', redirectTo: ROUTES.ADMIN.DASHBOARD, pathMatch: 'full' },
    ],
  },
];