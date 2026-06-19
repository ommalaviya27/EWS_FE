import { PaginationRequest, PaginationResponse } from '../components/pagination/pagination.model';

export type { PaginationRequest, PaginationResponse };

export enum AttendanceStatus {
  Present_WFO = 1,
  Present_WFH = 2,
  Absent = 3,
  HalfDay_WFO = 4,
  HalfDay_WFH = 5,
}

export enum ApprovalStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: AttendanceStatus.Present_WFO, label: 'Present - WFO' },
  { value: AttendanceStatus.Present_WFH, label: 'Present - WFH' },
  { value: AttendanceStatus.Absent, label: 'Absent' },
  { value: AttendanceStatus.HalfDay_WFO, label: 'HalfDay - WFO' },
  { value: AttendanceStatus.HalfDay_WFH, label: 'HalfDay - WFH' },
];

export interface AttendanceDayResponse {
  day: number;
  dayName: string;
  isWeekend: boolean;
  isToday: boolean;
  attendanceId: number | null;
  status: AttendanceStatus | null;
  statusDisplay: string | null;
  approvalStatus: ApprovalStatus | null;
  approvalStatusDisplay: string | null;
  isAutoAbsent: boolean;
  canEdit: boolean;
  isPublicHoliday: boolean;
  holidayName?: string;
}

export interface AttendanceMonthResponse {
  month: number;
  year: number;
  monthLabel: string;
  userId: number;
  userName: string;
  totalDays: number;
  presentCount: number;
  absentCount: number;
  days: AttendanceDayResponse[];
}

export interface AttendanceResponse {
  id: number;
  userId: number;
  userName: string;
  attendanceDate: string;
  status: AttendanceStatus;
  statusDisplay: string;
  approvalStatus: ApprovalStatus;
  approvalStatusDisplay: string;
}

export interface AddAttendanceRequest {
  status: AttendanceStatus;
}

export interface AdminAddAttendanceRequest {
  userId: number;
  status: AttendanceStatus;
  attendanceDate?: string;
}

export interface EditAttendanceRequest {
  status: AttendanceStatus;
}

export interface ReviewAttendanceRequest {
  approvalStatus: ApprovalStatus;
  reviewerRemark?: string;
}