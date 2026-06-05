export enum TaskStatuses {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  OnHold = 4,
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
}

export const TASK_STATUS_LABELS: Record<TaskStatuses, string> = {
  [TaskStatuses.Pending]: 'Pending',
  [TaskStatuses.InProgress]: 'In Progress',
  [TaskStatuses.Completed]: 'Completed',
  [TaskStatuses.OnHold]: 'On Hold',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'Low',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.High]: 'High',
};

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface MyTask {
  id: number;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  assignedToUserId: number;
  assignedToUserName: string;
  assignedByUserId: number;
  assignedByUserName: string;
  taskStatus: TaskStatuses;
  priority: TaskPriority;
  dueDate: string;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface AddCommentRequest {
  comment: string;
}

export interface UpdateCommentRequest {
  taskId: number;
  comment: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatuses;
}

export interface EmployeeDashboard {
  assignedTaskCount: number;
  completedTaskCount: number;
  upcomingDeadlineCount: number;
  upcomingDeadlines: MyTask[];
  onHoldTasks: MyTask[];
  completedTasks: MyTask[];
  overdueTasks: MyTask[];
}

export interface MyTaskFilterParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  Status?: string;
  Priority?: string;
  DueDateFrom?: string;
  DueDateTo?: string;
}