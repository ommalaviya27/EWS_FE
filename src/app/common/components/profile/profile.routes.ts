import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./my-profile/my-profile').then((m) => m.MyProfile),
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./change-password/change-password').then((m) => m.ChangePassword),
  },
];
