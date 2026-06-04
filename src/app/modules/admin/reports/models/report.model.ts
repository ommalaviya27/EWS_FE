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

export interface TaskStatusDistribution {
  pending: number;
  inProgress: number;
  completed: number;
  onHold: number;
  total: number;
}

export interface TaskPriorityDistribution {
  low: number;
  medium: number;
  high: number;
  total: number;
}

export interface TaskCompletionOverview {
  statusDistribution: TaskStatusDistribution;
  priorityDistribution: TaskPriorityDistribution;
}

export interface TaskCompletionSummaryItem {
  taskId: number;
  title: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  projectName: string;
}

export type TaskCompletionSummaryReport = PaginationResponse<TaskCompletionSummaryItem>;

// Project Progress 

export interface ProjectStatusDistribution {
  active: number;
  completed: number;
  total: number;
}

export interface ProjectProgressOverview {
  statusDistribution: ProjectStatusDistribution;
}

export interface ProjectProgressSummaryItem {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  onHoldTasks: number;
  progressPercentage: number;
}

export type ProjectProgressSummaryReport = PaginationResponse<ProjectProgressSummaryItem>;