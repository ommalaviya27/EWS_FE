import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { TeamLeadDashboard } from '../models/team-lead-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TeamLeadDashboardService {
  private apiService = inject(ApiService);

  getDashboard(): Observable<ApiResponse<TeamLeadDashboard>> {
    return this.apiService.get<TeamLeadDashboard>(API_ROUTES.TASK.GET_TEAM_LEAD_DASHBOARD);
  }
}
