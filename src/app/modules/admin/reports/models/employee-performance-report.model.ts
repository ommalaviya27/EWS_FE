import { PaginationResponse } from 'src/app/common/components/pagination/pagination.model';

export type ReportFilter = 'weekly' | 'monthly';

export interface TopEmployeeTask {
  userId: number;
  employeeName: string;
  completed: number;
  inProgress: number;
  onHold: number;
  pending: number;
  total: number;
}

export interface EmployeeTaskSummary {
  userId: number;
  employeeName: string;
  email: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  onHold: number;
  completionRate: number;
}

export interface EmployeePerformanceReport {
  topEmployees: TopEmployeeTask[];
}

export type EmployeeSummaryReport = PaginationResponse<EmployeeTaskSummary>;