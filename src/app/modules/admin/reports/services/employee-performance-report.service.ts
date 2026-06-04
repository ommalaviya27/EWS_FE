import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../common/services/api.service';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { EmployeePerformanceReport, EmployeeSummaryReport, ReportFilter } from '../models/employee-performance-report.model';

@Injectable({ providedIn: 'root' })
export class EmployeePerformanceReportService {
  private readonly api = inject(ApiService);

  getPerformanceReport(filter: ReportFilter): Observable<ApiResponse<EmployeePerformanceReport>> {
    return this.api.get<EmployeePerformanceReport>(
      API_ROUTES.REPORT.GET_EMPLOYEE_PERFORMANCE_REPORT,
      { filter }
    );
  }

  getEmployeeSummary(
    pageNumber: number,
    pageSize: number,
    search: string
  ): Observable<ApiResponse<EmployeeSummaryReport>> {
    const params: Record<string, string> = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    };
    if (search.trim()) params['search'] = search.trim();
    return this.api.get<EmployeeSummaryReport>(API_ROUTES.REPORT.GET_EMPLOYEE_SUMMARY, params);
  }
}