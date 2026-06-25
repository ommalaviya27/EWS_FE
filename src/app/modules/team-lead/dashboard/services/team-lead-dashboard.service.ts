import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { TeamLeadDashboard } from '../models/team-lead-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TeamLeadDashboardService {
  private apiService = inject(ApiService);

  getDashboard(): Observable<ApiResponse<TeamLeadDashboard>> {
    return this.apiService.get<TeamLeadDashboard>(API_ROUTES.TASK.GET_TEAM_LEAD_DASHBOARD);
  }
}