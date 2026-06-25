import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService, ApiService } from '@services';
import { ROUTES, API_ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest, UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.apiService.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, payload);
  }

  signup(payload: SignupRequest): Observable<ApiResponse<SignupResponse>> {
    return this.apiService.post<SignupResponse>(API_ROUTES.AUTH.SIGNUP, payload);
  }

  refresh(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = this.sessionService.getRefreshToken();
    return this.apiService.post<LoginResponse>(API_ROUTES.AUTH.REFRESH, {
      refreshToken,
    } as RefreshTokenRequest);
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.apiService.post<null>(API_ROUTES.AUTH.FORGOT_PASSWORD, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.apiService.post<null>(API_ROUTES.AUTH.RESET_PASSWORD, payload);
  }

  logout(): void {
    const refreshToken = this.sessionService.getRefreshToken();
    this.apiService
      .post<null>(API_ROUTES.AUTH.LOGOUT, { refreshToken } as RefreshTokenRequest)
      .subscribe({ error: () => {} });
    this.sessionService.clearAll();
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }

  isLoggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }

  redirectByRole(roleId: number): void {
    if (roleId === UserRole.Admin) {
      this.router.navigate([ROUTES.ADMIN.ADMIN_ABSOLUTE]);
    } else if (roleId === UserRole.TeamLead) {
      this.router.navigate([ROUTES.TEAM_LEAD.TEAM_LEAD_ABSOLUTE]);
    } else {
      this.router.navigate([ROUTES.EMPLOYEE.EMPLOYEE_ABSOLUTE]);
    }
  }
}