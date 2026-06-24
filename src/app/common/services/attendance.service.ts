import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import { AttendanceMonthResponse, AttendanceTeamMonthResponse, AttendanceResponse, AddAttendanceRequest, AdminAddAttendanceRequest, EditAttendanceRequest } from '../models/attendance.model';
import { API_ROUTES } from '../constants';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private api = inject(ApiService);

  getMonthly( month: number, year: number, userId?: number ): Observable<ApiResponse<AttendanceMonthResponse>> {
    const params: Record<string, string> = {
      month: month.toString(),
      year: year.toString(),
    };
    if (userId != null) params['userId'] = userId.toString();
    return this.api.get<AttendanceMonthResponse>(API_ROUTES.ATTENDANCE.GET_MONTHLY, params);
  }

  getTeamMonthly( month: number, year: number, userIds: number[] ): Observable<ApiResponse<AttendanceTeamMonthResponse>> {
    const params: Record<string, string | string[]> = {
      month: month.toString(),
      year: year.toString(),
      userIds: userIds.map((id) => id.toString()),
    };
    return this.api.get<AttendanceTeamMonthResponse>(API_ROUTES.ATTENDANCE.GET_TEAM_MONTHLY, params);
  }

  add(status: number): Observable<ApiResponse<AttendanceResponse>> {
    const body: AddAttendanceRequest = { status };
    return this.api.post<AttendanceResponse>(API_ROUTES.ATTENDANCE.ADD, body);
  }

  adminFill(request: AdminAddAttendanceRequest): Observable<ApiResponse<AttendanceResponse>> {
    return this.api.post<AttendanceResponse>(API_ROUTES.ATTENDANCE.ADD_ATTENDANCE_ADMIN, request);
  }

  edit(id: number, status: number): Observable<ApiResponse<AttendanceResponse>> {
    const body: EditAttendanceRequest = { status };
    return this.api.put<AttendanceResponse>(API_ROUTES.ATTENDANCE.EDIT(id), body);
  }

  approveAllPending(): Observable<ApiResponse<number>> {
    return this.api.post<number>(API_ROUTES.ATTENDANCE.APPROVE_ALL_PENDING);
  }
}