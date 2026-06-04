export enum ProjectStatus {
  Active = 1,
  Completed = 2,
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Active',
  [ProjectStatus.Completed]: 'Completed',
};

export const PROJECT_STATUS_LIST = [
  { value: ProjectStatus.Active, label: 'Active' },
  { value: ProjectStatus.Completed, label: 'Completed' },
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

export interface ProjectFilterParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  projectStatus?: string | number | null;
  teamLeadId?: string | number | null;
  startDateFrom?: string | null;
  endDateTo?: string | null;
}