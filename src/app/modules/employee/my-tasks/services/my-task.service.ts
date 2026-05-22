import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiService } from '../../../../common/services/api.service';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { API_ROUTES } from '../../../../common/constants/api-routes';
import { MyTask, TaskComment, TaskAttachment, AddCommentRequest, UpdateCommentRequest, UpdateTaskStatusRequest } from '../models/my-task.model';

@Injectable({ providedIn: 'root' })
export class MyTaskService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  getMyTasks(): Observable<ApiResponse<MyTask[]>> {
    return this.apiService.get<MyTask[]>(API_ROUTES.MY_TASKS.GET_MY_TASKS);
  }

  updateTaskStatus(taskId: number, payload: UpdateTaskStatusRequest): Observable<ApiResponse<MyTask>> {
    return this.apiService.patch<MyTask>(API_ROUTES.MY_TASKS.UPDATE_STATUS(taskId), payload);
  }

  getComments(taskId: number): Observable<ApiResponse<TaskComment[]>> {
    return this.apiService.get<TaskComment[]>(API_ROUTES.MY_TASKS.GET_COMMENTS(taskId));
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
}