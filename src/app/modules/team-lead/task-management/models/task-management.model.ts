import { TaskAttachment, TaskComment } from "../../../employee/my-tasks/models/my-task.model";

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

export const TASK_STATUS_LIST = [
  { value: TaskStatuses.Pending, label: 'Pending' },
  { value: TaskStatuses.InProgress, label: 'In Progress' },
  { value: TaskStatuses.Completed, label: 'Completed' },
  { value: TaskStatuses.OnHold, label: 'On Hold' },
];

export const TASK_PRIORITY_LIST = [
  { value: TaskPriority.Low, label: 'Low' },
  { value: TaskPriority.Medium, label: 'Medium' },
  { value: TaskPriority.High, label: 'High' },
];

export interface Task {
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

export interface TeamMember {
  userId: number;
  name: string;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  assignedToUserId: number;
  dueDate: string;
  status: TaskStatuses;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  id: number;
  title: string;
  description: string;
  projectId: string;
  assignedToUserId: number;
  dueDate: string;
  status: TaskStatuses;
  priority: TaskPriority;
}

export interface ProjectCardData {
  id: string;
  name: string;
  description: string;
  projectStatus: number;
  startDate: string;
  endDate: string;
}