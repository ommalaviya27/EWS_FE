import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { AdminDashboard } from '../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private apiService = inject(ApiService);

  getDashboard(): Observable<ApiResponse<AdminDashboard>> {
    return this.apiService.get<AdminDashboard>(API_ROUTES.ADMIN.GET_DASHBOARD);
  }
}