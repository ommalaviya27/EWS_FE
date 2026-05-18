import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { Employee, TeamLead, CreateEmployeeRequest, UpdateEmployeeRequest, UserPaginationRequest, UserPagedResponse } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiService = inject(ApiService);

  getAll(pagination: UserPaginationRequest): Observable<ApiResponse<UserPagedResponse>> {
    const params: Record<string, string> = {
      PageNumber: pagination.pageNumber.toString(),
      PageSize: pagination.pageSize.toString(),
    };
    if (pagination.filter !== 'all') {
      params['Filter'] = pagination.filter;
    }
    return this.apiService.get<UserPagedResponse>(API_ROUTES.EMPLOYEE.GET_ALL, params);
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    return this.apiService.get<Employee>(API_ROUTES.EMPLOYEE.GET_BY_ID(id));
  }

  getTeamLeads(): Observable<ApiResponse<TeamLead[]>> {
    return this.apiService.get<TeamLead[]>(API_ROUTES.PROJECT.GET_TEAM_LEADERS);
  }

  create(payload: CreateEmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.apiService.post<Employee>(API_ROUTES.EMPLOYEE.CREATE, payload);
  }

  update(id: number, payload: UpdateEmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.apiService.put<Employee>(API_ROUTES.EMPLOYEE.UPDATE(id), payload);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(API_ROUTES.EMPLOYEE.DELETE(id));
  }
}