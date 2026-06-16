import { TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_LIST, TASK_PRIORITY_LIST} from '../../../team-lead/task-management/models/task-management.model';

export { TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_LIST, TASK_PRIORITY_LIST };

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
  taskStatus: TaskStatuses;
  priority: TaskPriority;
  dueDate: string;
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