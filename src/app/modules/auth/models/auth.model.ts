export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: number;
  roleId: number;
  name: string;
  email: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
}

export interface SignupResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
// Role IDs matching backend (role_id column)
export enum UserRole {
  Admin     = 1,
  TeamLead  = 2,
  Employee  = 3,
}
export const ROLE_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Team Lead',
  3: 'Employee',
};