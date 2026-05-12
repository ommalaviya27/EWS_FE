import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { AuthService } from '../../modules/auth/services/auth.service';
import { ROUTES } from '../constants/route-paths';
import { map, catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { LoginResponse } from '../../modules/auth/models/auth.model';

export const AuthGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const authService    = inject(AuthService);
  const router         = inject(Router);

  if (sessionService.isLoggedIn()) return true;

  return authService.refresh().pipe(
    map((res: ApiResponse<LoginResponse>) => {
      if (res.isSuccess && res.data) {
        sessionService.setSession(res.data);
        return true;
      }
      sessionService.clearAll();
      router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
      return false;
    }),
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        sessionService.clearAll();
      }
      router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
      return of(false);
    })
  );
};

export const AdminGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router         = inject(Router);
  if (!sessionService.isLoggedIn()) {
    router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
    return false;
  }
  if (!sessionService.isAdmin()) {
    if (sessionService.isTeamLead()) {
      router.navigate([ROUTES.TEAM_LEAD.TEAM_LEAD_ABSOLUTE]);
    } else {
      router.navigate([ROUTES.EMPLOYEE.EMPLOYEE_ABSOLUTE]);
    }
    return false;
  }
  return true;
};

export const TeamLeadGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router         = inject(Router);
  if (!sessionService.isLoggedIn()) {
    router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
    return false;
  }
  if (!sessionService.isTeamLead()) {
    if (sessionService.isAdmin()) {
      router.navigate([ROUTES.ADMIN.ADMIN_ABSOLUTE]);
    } else {
      router.navigate([ROUTES.EMPLOYEE.EMPLOYEE_ABSOLUTE]);
    }
    return false;
  }
  return true;
};

export const EmployeeGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router         = inject(Router);
  if (!sessionService.isLoggedIn()) {
    router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
    return false;
  }
  if (!sessionService.isEmployee()) {
    if (sessionService.isAdmin()) {
      router.navigate([ROUTES.ADMIN.ADMIN_ABSOLUTE]);
    } else {
      router.navigate([ROUTES.TEAM_LEAD.TEAM_LEAD_ABSOLUTE]);
    }
    return false;
  }
  return true;
};