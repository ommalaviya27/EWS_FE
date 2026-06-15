import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../../project/models/project.model';
import { MyTask, TaskPriority, TASK_PRIORITY_LABELS } from '../../../employee/my-tasks/models/my-task.model';

export { ProjectStatus, PROJECT_STATUS_LABELS };
export { TaskPriority, TASK_PRIORITY_LABELS };
export type { MyTask, Project };

export interface AdminDashboard {
  totalEmployees: number;
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  overdueProjects: Project[];
  recentCompletedProjects: Project[];
  overdueTasks: MyTask[];
}