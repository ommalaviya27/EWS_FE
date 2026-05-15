import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { PaginationRequest, PaginationResponse } from '../../../../common/components/pagination/pagination.model';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiService = inject(ApiService);

  getAll(pagination: PaginationRequest): Observable<ApiResponse<PaginationResponse<Employee>>> {
    const params = {
      PageNumber: pagination.pageNumber.toString(),
      PageSize: pagination.pageSize.toString(),
    };
    return this.apiService.get<PaginationResponse<Employee>>(API_ROUTES.EMPLOYEE.GET_ALL, params);
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    return this.apiService.get<Employee>(API_ROUTES.EMPLOYEE.GET_BY_ID(id));
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