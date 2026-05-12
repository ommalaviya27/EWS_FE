import { Routes } from '@angular/router';
import { ROUTES } from '../../common/constants/route-paths';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ROUTES.AUTH.LOGIN.LOGIN,
        loadComponent: () =>
          import('./components/login/login').then((m) => m.Login),
      },
      {
        path: ROUTES.AUTH.SIGNUP.SIGNUP,
        loadComponent: () =>
          import('./components/signup/signup').then((m) => m.Signup),
      },
      {
        path: ROUTES.AUTH.FORGOT_PASSWORD.FORGOT_PASSWORD,
        loadComponent: () =>
          import('./components/forgot-password/forgot-password').then(
            (m) => m.ForgotPassword
          ),
      },
      {
        path: ROUTES.AUTH.RESET_PASSWORD.RESET_PASSWORD,
        loadComponent: () =>
          import('./components/reset-password/reset-password').then(
            (m) => m.ResetPassword
          ),
      },
      { path: '', redirectTo: ROUTES.AUTH.LOGIN.LOGIN, pathMatch: 'full' },
    ],
  },
];
