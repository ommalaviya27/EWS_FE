import { MyTask, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../../employee/my-tasks/models/my-task.model';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../../../admin/project/models/project.model';
export { TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS };
export { ProjectStatus, PROJECT_STATUS_LABELS };
export type { MyTask };

export interface TeamLeadDashboard {
  myTeamTaskCount: number;
  overdueTaskCount: number;
  activeProjectCount: number;
  activeProjects: Project[];
  completedProjects: Project[];
  recentTeamTasks: MyTask[];
  recentTeamTasksTotalCount: number;
  overdueTasks: MyTask[];
}