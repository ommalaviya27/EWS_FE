import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { GetProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '../models/profile.model';
import { API_ROUTES } from '../constants/api-routes';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiService = inject(ApiService);

  getProfile(): Observable<ApiResponse<GetProfileResponse>> {
    return this.apiService.get<GetProfileResponse>(API_ROUTES.PROFILE.GET);
  }

  updateProfile(payload: UpdateProfileRequest): Observable<ApiResponse<GetProfileResponse>> {
    return this.apiService.put<GetProfileResponse>(API_ROUTES.PROFILE.UPDATE, payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<ApiResponse<null>> {
    return this.apiService.post<null>(API_ROUTES.PROFILE.CHANGE_PASSWORD, payload);
  }
}
