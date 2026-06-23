import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { PaginationRequest, PaginationResponse } from '../../../../common/components/pagination/pagination.model';
import { Project, TeamLeader, CreateProjectRequest, UpdateProjectRequest, ProjectFilterParams } from '../models/project.model';
import { Task } from '../../../team-lead/task-management/models/task-management.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiService = inject(ApiService);

  getAll(filters: ProjectFilterParams): Observable<ApiResponse<PaginationResponse<Project>>> {
    const params: Record<string, string> = {
      PageNumber: filters.pageNumber.toString(),
      PageSize: filters.pageSize.toString(),
    };

    if (filters.search?.trim()) {
      params['Search'] = filters.search.trim();
    }

    if (filters.projectStatus != null && filters.projectStatus !== '') {
      params['ProjectStatus'] = filters.projectStatus.toString();
    }

    if (filters.reportingId != null && filters.reportingId !== '') {
      params['ReportingId'] = filters.reportingId.toString();
    }

    if (filters.startDateFrom != null && filters.startDateFrom !== '') {
      params['StartDateFrom'] = filters.startDateFrom.toString();
    }

    if (filters.endDateTo != null && filters.endDateTo !== '') {
      params['EndDateTo'] = filters.endDateTo.toString();
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