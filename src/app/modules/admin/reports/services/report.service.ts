import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@services';
import { ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { EmployeePerformanceReport, EmployeeSummaryReport, ReportFilter, TaskCompletionOverview, TaskCompletionSummaryReport, ProjectProgressOverview, ProjectProgressSummaryReport } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  getPerformanceReport(filter: ReportFilter): Observable<ApiResponse<EmployeePerformanceReport>> {
    return this.api.get<EmployeePerformanceReport>(
      API_ROUTES.REPORT.GET_EMPLOYEE_PERFORMANCE_REPORT,
      { filter }
    );
  }

  getEmployeeSummary( pageNumber: number, pageSize: number, search: string ): Observable<ApiResponse<EmployeeSummaryReport>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };
    if (search.trim()) params['search'] = search.trim();
    return this.api.get<EmployeeSummaryReport>(API_ROUTES.REPORT.GET_EMPLOYEE_SUMMARY, params);
  }

  getTaskCompletionOverview(filter: ReportFilter): Observable<ApiResponse<TaskCompletionOverview>> {
    return this.api.get<TaskCompletionOverview>(
      API_ROUTES.REPORT.GET_TASK_COMPLETION_OVERVIEW,
      { filter }
    );
  }

  getTaskCompletionSummary( pageNumber: number, pageSize: number, search: string ): Observable<ApiResponse<TaskCompletionSummaryReport>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };
    if (search.trim()) params['search'] = search.trim();
    return this.api.get<TaskCompletionSummaryReport>(
      API_ROUTES.REPORT.GET_TASK_COMPLETION_SUMMARY,
      params
    );
  }

  getProjectProgressOverview(): Observable<ApiResponse<ProjectProgressOverview>> {
    return this.api.get<ProjectProgressOverview>(
      API_ROUTES.REPORT.GET_PROJECT_PROGRESS_OVERVIEW
    );
  }

  getProjectProgressSummary( pageNumber: number, pageSize: number, search: string ): Observable<ApiResponse<ProjectProgressSummaryReport>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };
    if (search.trim()) params['search'] = search.trim();
    return this.api.get<ProjectProgressSummaryReport>(
      API_ROUTES.REPORT.GET_PROJECT_PROGRESS_SUMMARY,
      params
    );
  }
}