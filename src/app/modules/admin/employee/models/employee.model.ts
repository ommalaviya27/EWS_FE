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
    status: boolean;
    createdAt: string;
  }
  
  export interface CreateEmployeeRequest {
    name: string;
    email: string;
    password: string;
    mobileNumber: string;
    roleId: number;
    status: boolean;
  }
  
  export interface UpdateEmployeeRequest {
    name: string;
    email: string;
    mobileNumber: string;
    roleId: number;
    status: boolean;
  }