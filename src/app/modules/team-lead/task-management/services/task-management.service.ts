import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { PaginationResponse } from '../../../../common/components/pagination/pagination.model';
import { Task, TeamMember, ProjectOption, CreateTaskRequest, UpdateTaskRequest, ProjectCardData, TaskFilterParams } from '../models/task-management.model';

@Injectable({ providedIn: 'root' })
export class TaskManagementService {
  private apiService = inject(ApiService);

  getAll(pagination: TaskFilterParams, projectId?: string): Observable<ApiResponse<PaginationResponse<Task>>> {
    const params: Record<string, string> = {
      PageNumber: pagination.pageNumber.toString(),
      PageSize: pagination.pageSize.toString(),
    };

    if (pagination.search?.trim()) {
      params['Search'] = pagination.search.trim();
    }

    if (pagination.Status) params['Status'] = pagination.Status;
    if (pagination.Priority) params['Priority'] = pagination.Priority;
    if (pagination.DueDateFrom) params['DueDateFrom'] = pagination.DueDateFrom;
    if (pagination.DueDateTo) params['DueDateTo'] = pagination.DueDateTo;

    if (projectId) params['projectId'] = projectId;
    return this.apiService.get<PaginationResponse<Task>>(API_ROUTES.TASK.GET_ALL, params);
  }

  getById(id: number): Observable<ApiResponse<Task>> {
    return this.apiService.get<Task>(API_ROUTES.TASK.GET_BY_ID(id));
  }

  getMyProjects(): Observable<ApiResponse<ProjectOption[]>> {
    return this.apiService.get<ProjectOption[]>(API_ROUTES.TASK.GET_MY_PROJECTS);
  }

  getMyProjectsFull(pageNumber: number, pageSize: number, search?: string): Observable<ApiResponse<PaginationResponse<ProjectCardData>>> {
    const params: Record<string, string> = {
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    };
    if (search?.trim()) params['Search'] = search.trim();
    return this.apiService.get<PaginationResponse<ProjectCardData>>(API_ROUTES.TASK.GET_MY_PROJECTS, params);
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