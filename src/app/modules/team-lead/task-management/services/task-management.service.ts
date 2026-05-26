import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { ApiResponse } from '../../../../common/models/api-response.model';
import {
  PaginationRequest,
  PaginationResponse,
} from '../../../../common/components/pagination/pagination.model';
import {
  Task,
  TeamMember,
  ProjectOption,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectCardData,
} from '../models/task-management.model';

@Injectable({ providedIn: 'root' })
export class TaskManagementService {
  private apiService = inject(ApiService);

  getAll(pagination: PaginationRequest & { search?: string }, projectId?: string): Observable<ApiResponse<PaginationResponse<Task>>> {
    const params: Record<string, string> = {
      PageNumber: pagination.pageNumber.toString(),
      PageSize: pagination.pageSize.toString(),
    };

    if (pagination.search?.trim()) {
      params['Search'] = pagination.search.trim();
    }

    if (projectId) params['projectId'] = projectId;
    return this.apiService.get<PaginationResponse<Task>>(API_ROUTES.TASK.GET_ALL, params);
  }

  getById(id: number): Observable<ApiResponse<Task>> {
    return this.apiService.get<Task>(API_ROUTES.TASK.GET_BY_ID(id));
  }

  getMyProjects(): Observable<ApiResponse<ProjectOption[]>> {
    return this.apiService.get<ProjectOption[]>(API_ROUTES.TASK.GET_MY_PROJECTS);
  }

  getMyProjectsFull(): Observable<ApiResponse<ProjectCardData[]>> {
    return this.apiService.get<ProjectCardData[]>(API_ROUTES.TASK.GET_MY_PROJECTS);
  }

  getTeamMembers(): Observable<ApiResponse<TeamMember[]>> {
    return this.apiService.get<TeamMember[]>(API_ROUTES.TASK.GET_TEAM_MEMBERS);
  }

  create(payload: CreateTaskRequest): Observable<ApiResponse<Task>> {
    return this.apiService.post<Task>(API_ROUTES.TASK.CREATE, payload);
  }

  update(id: number, payload: UpdateTaskRequest): Observable<ApiResponse<Task>> {
    return this.apiService.put<Task>(API_ROUTES.TASK.UPDATE(id), payload);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(API_ROUTES.TASK.DELETE(id));
  }
}
