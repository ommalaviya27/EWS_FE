export enum ProjectStatus {
  Active = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4,
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Active',
  [ProjectStatus.Completed]: 'Completed',
  [ProjectStatus.OnHold]: 'On Hold',
  [ProjectStatus.Cancelled]: 'Cancelled',
};

export const PROJECT_STATUS_LIST = [
  { value: ProjectStatus.Active, label: 'Active' },
  { value: ProjectStatus.Completed, label: 'Completed' },
  { value: ProjectStatus.OnHold, label: 'On Hold' },
  { value: ProjectStatus.Cancelled, label: 'Cancelled' },
];

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: number;
  projectStatus: ProjectStatus;
  startDate: string;
  endDate: string;
}

export interface TeamLeader {
  userId: number;
  name: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  userId: number;
  startDate: string;
  endDate: string;
  projectStatus: ProjectStatus;
}

export interface UpdateProjectRequest {
  id: string;
  name: string;
  description: string;
  userId: number;
  startDate: string;
  endDate: string;
  projectStatus: ProjectStatus;
}