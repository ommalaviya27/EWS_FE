import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../../project/models/project.model';
import { MyTask, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../../employee/my-tasks/models/my-task.model';

export { ProjectStatus, PROJECT_STATUS_LABELS };
export { TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS };
export type { MyTask, Project };

export interface AdminDashboard {
  totalEmployees: number;
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  overdueProjects: Project[];
  recentCompletedProjects: Project[];
  inProgressTasks: MyTask[];
}