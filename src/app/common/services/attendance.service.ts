import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import { AttendanceMonthResponse, AttendanceResponse, AddAttendanceRequest, AdminAddAttendanceRequest, EditAttendanceRequest, ReviewAttendanceRequest } from '../models/attendance.model';
import { PaginationRequest, PaginationResponse } from '../components/pagination/pagination.model';
import { API_ROUTES } from '../constants';

const BASE = '/api/attendance';

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

  getPendingForReview(pagination: PaginationRequest): Observable<ApiResponse<PaginationResponse<AttendanceResponse>>> {
    const params: Record<string, string> = {
      pageNumber: pagination.pageNumber.toString(),
      pageSize: pagination.pageSize.toString(),
    };
    return this.api.get<PaginationResponse<AttendanceResponse>>(API_ROUTES.ATTENDANCE.GET_PENDING_ATTENDANCE, params);
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

  review(id: number, request: ReviewAttendanceRequest): Observable<ApiResponse<AttendanceResponse>> {
    return this.api.put<AttendanceResponse>(API_ROUTES.ATTENDANCE.REVIEW_ATTENDANCE(id), request);
  }

  approveAllPending(): Observable<ApiResponse<number>> {
    return this.api.post<number>(API_ROUTES.ATTENDANCE.APPROVE_ALL_PENDING);
  }
}