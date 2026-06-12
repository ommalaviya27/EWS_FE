import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { LeaveResponse, ApplyLeaveRequest, EditLeaveRequest, ReviewLeaveRequest } from '../models/leave.model';
import { PaginationResponse } from '../components/pagination/pagination.model';
import { API_ROUTES } from '../constants';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private api = inject(ApiService);

  getMyLeaves(params: Record<string, string>): Observable<ApiResponse<PaginationResponse<LeaveResponse>>> {
    return this.api.get<PaginationResponse<LeaveResponse>>(API_ROUTES.LEAVE.GET_MY_LEAVES, params);
  }

  getPendingForReview(params: Record<string, string>): Observable<ApiResponse<PaginationResponse<LeaveResponse>>> {
    return this.api.get<PaginationResponse<LeaveResponse>>(API_ROUTES.LEAVE.GET_PENDING_REVIEW, params);
  }

  getById(id: number): Observable<ApiResponse<LeaveResponse>> {
    return this.api.get<LeaveResponse>(API_ROUTES.LEAVE.GET_BY_ID(id));
  }

  apply(request: ApplyLeaveRequest): Observable<ApiResponse<LeaveResponse>> {
    return this.api.post<LeaveResponse>(API_ROUTES.LEAVE.APPLY, request);
  }

  edit(id: number, request: EditLeaveRequest): Observable<ApiResponse<LeaveResponse>> {
    return this.api.put<LeaveResponse>(API_ROUTES.LEAVE.EDIT(id), request);
  }

  review(id: number, request: ReviewLeaveRequest): Observable<ApiResponse<LeaveResponse>> {
    return this.api.put<LeaveResponse>(API_ROUTES.LEAVE.REVIEW(id), request);
  }
}