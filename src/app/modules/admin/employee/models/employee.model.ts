export enum EmployeeRole {
  Admin = 1,
  TeamLead = 2,
  Employee = 3,
}

export const EMPLOYEE_ROLE_LABELS: Record<number, string> = {
  [EmployeeRole.Admin]: 'Admin',
  [EmployeeRole.TeamLead]: 'Team Lead',
  [EmployeeRole.Employee]: 'Employee',
};

export const EMPLOYEE_ROLE_LIST = [
  { value: EmployeeRole.Admin, label: 'Admin' },
  { value: EmployeeRole.TeamLead, label: 'Team Lead' },
  { value: EmployeeRole.Employee, label: 'Employee' },
];

export interface Employee {
  userId: number;
  name: string;
  email: string;
  mobileNumber: string;
  roleId: number;
  roleName: string;
  teamLeadId: number | null;
  teamLeadName: string | null;
  status: boolean;
}

export interface TeamLead {
  userId: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  status: boolean;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  roleId: number;
  teamLeadId: number | null;
  status: boolean;
}

export interface UpdateEmployeeRequest {
  name: string;
  email: string;
  mobileNumber: string;
  roleId: number;
  teamLeadId: number | null;
  status: boolean;
}

export interface UserSummary {
  totalEmployees: number;
  assignedCount: number;
  unassignedCount: number;
}

export interface UserPagedResponse {
  items: Employee[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  summary: UserSummary;
}

export interface UserPaginationRequest {
  pageNumber: number;
  pageSize: number;
  filter: 'all' | 'assigned' | 'unassigned';
}
