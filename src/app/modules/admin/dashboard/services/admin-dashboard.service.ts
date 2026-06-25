import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { AdminDashboard } from '../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private apiService = inject(ApiService);

  getDashboard(): Observable<ApiResponse<AdminDashboard>> {
    return this.apiService.get<AdminDashboard>(API_ROUTES.ADMIN.GET_DASHBOARD);
  }
}