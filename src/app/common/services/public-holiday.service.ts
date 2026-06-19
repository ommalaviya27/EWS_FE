import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { HolidayResponse, CreateHolidayRequest, UpdateHolidayRequest } from '../models/leave.model';
import { PaginationResponse } from '../components/pagination/pagination.model';
import { API_ROUTES } from '../constants';

@Injectable({ providedIn: 'root' })
export class PublicHolidayService {
  private api = inject(ApiService);

  getAll(params: Record<string, string>): Observable<ApiResponse<PaginationResponse<HolidayResponse>>> {
    return this.api.get<PaginationResponse<HolidayResponse>>(API_ROUTES.PUBLIC_HOLIDAY.GET_ALL, params);
  }

  getById(id: number): Observable<ApiResponse<HolidayResponse>> {
    return this.api.get<HolidayResponse>(API_ROUTES.PUBLIC_HOLIDAY.GET_BY_ID(id));
  }

  create(request: CreateHolidayRequest): Observable<ApiResponse<HolidayResponse>> {
    return this.api.post<HolidayResponse>(API_ROUTES.PUBLIC_HOLIDAY.CREATE, request);
  }

  update(id: number, request: UpdateHolidayRequest): Observable<ApiResponse<HolidayResponse>> {
    return this.api.put<HolidayResponse>(API_ROUTES.PUBLIC_HOLIDAY.UPDATE(id), request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ROUTES.PUBLIC_HOLIDAY.DELETE(id));
  }
}