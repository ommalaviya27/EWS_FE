import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'team-lead',
    loadChildren: () =>
      import('./modules/team-lead/team-lead.routes').then((m) => m.TEAM_LEAD_ROUTES),
  },
  {
    path: 'employee',
    loadChildren: () => import('./modules/employee/employee.routes').then((m) => m.EMPLOYEE_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('../app/common/components/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  { path: '**', redirectTo: 'auth/login' },
];
