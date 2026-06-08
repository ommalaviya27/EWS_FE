import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { API_ROUTES, ROUTES } from '../constants';
import { ApiResponse } from '../models/api-response.model';
import { LoginResponse } from '../../modules/auth/models/auth.model';

let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router         = inject(Router);
  const sessionService = inject(SessionService);
  const apiService     = inject(ApiService);

  const isAuthEndpoint =
    req.url.includes(API_ROUTES.AUTH.LOGIN) ||
    req.url.includes(API_ROUTES.AUTH.SIGNUP) ||
    req.url.includes(API_ROUTES.AUTH.REFRESH) ||
    req.url.includes(API_ROUTES.AUTH.FORGOT_PASSWORD) ||
    req.url.includes(API_ROUTES.AUTH.RESET_PASSWORD) ||
    req.url.includes(API_ROUTES.AUTH.LOGOUT);

  const isSkipRefreshEndpoint =
    req.url.includes(API_ROUTES.PROFILE.CHANGE_PASSWORD);

  const accessToken = sessionService.getAccessToken();

  const cloned = (accessToken && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint || isSkipRefreshEndpoint) {
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshDone$.next(null);

        return apiService
          .post<LoginResponse>(API_ROUTES.AUTH.REFRESH, {
            refreshToken: sessionService.getRefreshToken(),
          })
          .pipe(
            switchMap((res: ApiResponse<LoginResponse>) => {
              isRefreshing = false;
              if (res.isSuccess && res.data) {
                sessionService.setSession(res.data);
                refreshDone$.next(res.data.accessToken);

                const retried = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.data.accessToken}` },
                });
                return next(retried);
              }
              sessionService.clearAll();
              router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
              return throwError(() => err);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              sessionService.clearAll();
              router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
              return throwError(() => refreshErr);
            })
          );
      }

      return refreshDone$.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(newToken => {
          const retried = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken!}` },
          });
          return next(retried);
        })
      );
    })
  );
};