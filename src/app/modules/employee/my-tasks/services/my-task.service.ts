import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiService } from '@services';
import { PaginationResponse, ApiResponse } from '@models';
import { API_ROUTES } from '@constants';
import { MyTask, TaskComment, TaskAttachment, AddCommentRequest, UpdateCommentRequest, UpdateTaskStatusRequest, EmployeeDashboard, MyTaskFilterParams } from '../models/my-task.model';
import { Project } from '../../../admin/project/models/project.model';

@Injectable({ providedIn: 'root' })
export class MyTaskService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  getDashboard(): Observable<ApiResponse<EmployeeDashboard>> {
    return this.apiService.get<EmployeeDashboard>(API_ROUTES.MY_TASKS.GET_DASHBOARD);
  }

  getMyProjects(pageNumber: number, pageSize: number, search?: string): Observable<ApiResponse<PaginationResponse<Project>>> {
    const params: Record<string, string> = {
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    };
    if(search?.trim()) params['Search'] = search.trim();
    return this.apiService.get<PaginationResponse<Project>>(API_ROUTES.MY_TASKS.GET_MY_PROJECTS, params);
  }

  getMyTasks( filters: MyTaskFilterParams, projectId?: string): Observable<ApiResponse<PaginationResponse<MyTask>>> {
    const params: Record<string, string> = {
      PageNumber: filters.pageNumber.toString(),
      PageSize: filters.pageSize.toString(),
    };

    if (filters.search?.trim()) params['Search'] = filters.search.trim();
    if (filters.Status) params['Status'] = filters.Status;
    if (filters.Priority) params['Priority'] = filters.Priority;
    if (filters.DueDateFrom) params['DueDateFrom'] = filters.DueDateFrom;
    if (filters.DueDateTo) params['DueDateTo'] = filters.DueDateTo;
    if (projectId) params['projectId'] = projectId;

    return this.apiService.get<PaginationResponse<MyTask>>(
      API_ROUTES.MY_TASKS.GET_MY_TASKS,
      params
    );
  }

  updateTaskStatus(taskId: number, payload: UpdateTaskStatusRequest): Observable<ApiResponse<MyTask>> {
    return this.apiService.patch<MyTask>(API_ROUTES.MY_TASKS.UPDATE_STATUS(taskId), payload);
  }

  getComments(taskId: number, pageNumber: number = 1, pageSize: number = 5): Observable<ApiResponse<PaginationResponse<TaskComment>>> {
    return this.apiService.get<PaginationResponse<TaskComment>>(
      API_ROUTES.MY_TASKS.GET_COMMENTS(taskId),
      { PageNumber: pageNumber.toString(), PageSize: pageSize.toString() }
    );
  }

  addComment(taskId: number, payload: AddCommentRequest): Observable<ApiResponse<TaskComment>> {
    return this.apiService.post<TaskComment>(API_ROUTES.MY_TASKS.ADD_COMMENT(taskId), payload);
  }

  updateComment(commentId: number, payload: UpdateCommentRequest): Observable<ApiResponse<TaskComment>> {
    return this.apiService.put<TaskComment>(API_ROUTES.MY_TASKS.UPDATE_COMMENT(commentId), payload);
  }

  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(API_ROUTES.MY_TASKS.DELETE_COMMENT(commentId));
  }

  getAttachments(taskId: number, pageNumber: number = 1, pageSize: number = 5): Observable<ApiResponse<PaginationResponse<TaskAttachment>>> {
    return this.apiService.get<PaginationResponse<TaskAttachment>>(
      API_ROUTES.MY_TASKS.GET_ATTACHMENTS(taskId),
      { PageNumber: pageNumber.toString(), PageSize: pageSize.toString() }
    );
  }

  addAttachments(taskId: number, files: File[]): Observable<ApiResponse<TaskAttachment[]>> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f, f.name));
    return this.http
      .post<ApiResponse<TaskAttachment[]>>(
        `${this.baseUrl}${API_ROUTES.MY_TASKS.ADD_ATTACHMENTS(taskId)}`,
        formData
      )
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  deleteAttachment(attachmentId: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(API_ROUTES.MY_TASKS.DELETE_ATTACHMENT(attachmentId));
  }

  downloadAttachment(attachmentId: number, fileName: string): void {
    this.http
      .get(`${this.baseUrl}${API_ROUTES.MY_TASKS.DOWNLOAD_ATTACHMENT(attachmentId)}`, {
        responseType: 'blob',
      })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = fileName;
          anchor.click();
          URL.revokeObjectURL(url);
        },
      });
  }
}