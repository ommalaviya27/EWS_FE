export enum LeaveType {
  FullDay = 1,
  HalfDay = 2,
}

export enum ApprovalStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export const LEAVE_TYPE_OPTIONS = [
  { value: LeaveType.FullDay, label: 'Full Day' },
  { value: LeaveType.HalfDay, label: 'Half Day' },
];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.FullDay]: 'Full Day',
  [LeaveType.HalfDay]: 'Half Day',
};

export const LEAVE_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.Pending]: 'Pending',
  [ApprovalStatus.Approved]: 'Approved',
  [ApprovalStatus.Rejected]: 'Rejected',
};

export interface LeaveResponse {
  id: number;
  userId: number;
  userName: string;
  leaveType: LeaveType;
  leaveTypeDisplay: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveStatus: ApprovalStatus;
  leaveStatusDisplay: string;
  reviewerRemark: string | null;
  reviewedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ApplyLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface EditLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewLeaveRequest {
  leaveStatus: ApprovalStatus;
  reviewerRemark?: string | null;
}