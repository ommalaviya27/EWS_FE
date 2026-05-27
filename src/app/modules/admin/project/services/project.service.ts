import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { PaginationRequest, PaginationResponse } from '../../../../common/components/pagination/pagination.model';
import { Project, TeamLeader, CreateProjectRequest, UpdateProjectRequest } from '../models/project.model';
import { Task } from '../../../team-lead/task-management/models/task-management.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiService = inject(ApiService);

  getAll(pagination: PaginationRequest & { search?: string }): Observable<ApiResponse<PaginationResponse<Project>>> {
    const params: Record<string, string> = {
      PageNumber: pagination.pageNumber.toString(),
      PageSize: pagination.pageSize.toString(),
    };

    if (pagination.search?.trim()) {
      params['Search'] = pagination.search.trim();
    }

    return this.apiService.get<PaginationResponse<Project>>(API_ROUTES.PROJECT.GET_ALL, params);
  }

  getById(id: string): Observable<ApiResponse<Project>> {
    return this.apiService.get<Project>(API_ROUTES.PROJECT.GET_BY_ID(id));
  }

  getTeamLeaders(): Observable<ApiResponse<TeamLeader[]>> {
    return this.apiService.get<TeamLeader[]>(API_ROUTES.PROJECT.GET_TEAM_LEADERS);
  }

  getProjectTasks( projectId: string, pagination: PaginationRequest & { search?: string }
  ): Observable<ApiResponse<PaginationResponse<Task>>> {
    const params: Record<string, string> = {
      PageNumber: pagination.pageNumber.toString(),
      PageSize: pagination.pageSize.toString(),
    };

    if (pagination.search?.trim()) {
      params['Search'] = pagination.search.trim();
    }

    return this.apiService.get<PaginationResponse<Task>>(
      API_ROUTES.PROJECT.GET_TASKS(projectId),
      params
    );
  }

  create(payload: CreateProjectRequest): Observable<ApiResponse<Project>> {
    return this.apiService.post<Project>(API_ROUTES.PROJECT.CREATE, payload);
  }

  update(id: string, payload: UpdateProjectRequest): Observable<ApiResponse<Project>> {
    return this.apiService.put<Project>(API_ROUTES.PROJECT.UPDATE(id), payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(API_ROUTES.PROJECT.DELETE(id));
  }
}
