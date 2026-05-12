import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';
import { LoginResponse, UserRole } from '../../modules/auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _isLoggedIn = false;
  private _userId: number | null = null;
  private _roleId: number | null = null;
  private _name: string | null = null;
  private _email: string | null = null;

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    const token = localStorage.getItem(APP_CONSTANTS.ACCESS_TOKEN_KEY);
    const userRaw = localStorage.getItem(APP_CONSTANTS.USER_KEY);
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        this._isLoggedIn = true;
        this._userId = user.userId;
        this._roleId = user.roleId;
        this._name = user.name;
        this._email = user.email;
      } catch {
        this.clearAll();
      }
    }
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn;
  }
  markLoggedIn(): void {
    this._isLoggedIn = true;
  }

  setSession(data: LoginResponse): void {
    this._isLoggedIn = true;
    this._userId = data.userId;
    this._roleId = data.roleId;
    this._name = data.name;
    this._email = data.email;

    localStorage.setItem(APP_CONSTANTS.ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(APP_CONSTANTS.REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      APP_CONSTANTS.USER_KEY,
      JSON.stringify({
        userId: data.userId,
        roleId: data.roleId,
        name: data.name,
        email: data.email,
      })
    );
  }

  clearAll(): void {
    this._isLoggedIn = false;
    this._userId = null;
    this._roleId = null;
    this._name = null;
    this._email = null;
    localStorage.removeItem(APP_CONSTANTS.ACCESS_TOKEN_KEY);
    localStorage.removeItem(APP_CONSTANTS.REFRESH_TOKEN_KEY);
    localStorage.removeItem(APP_CONSTANTS.USER_KEY);
  }

  get userId(): number | null {
    return this._userId;
  }
  get roleId(): number | null {
    return this._roleId;
  }
  get name(): string | null {
    return this._name;
  }
  get email(): string | null {
    return this._email;
  }

  isAdmin(): boolean {
    return this._roleId === UserRole.Admin;
  }
  isTeamLead(): boolean {
    return this._roleId === UserRole.TeamLead;
  }
  isEmployee(): boolean {
    return this._roleId === UserRole.Employee;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.ACCESS_TOKEN_KEY);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.REFRESH_TOKEN_KEY);
  }
}
