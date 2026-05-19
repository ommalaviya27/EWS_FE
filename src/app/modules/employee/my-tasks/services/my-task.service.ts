import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiService } from '../../../../common/services/api.service';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { MyTask, TaskComment, TaskAttachment, AddCommentRequest } from '../models/my-task.model';

const BASE = '/api/my-tasks';

@Injectable({ providedIn: 'root' })
export class MyTaskService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  getMyTasks(): Observable<ApiResponse<MyTask[]>> {
    return this.apiService.get<MyTask[]>(`${BASE}/my-tasks`);
  }

  getComments(taskId: number): Observable<ApiResponse<TaskComment[]>> {
    return this.apiService.get<TaskComment[]>(`${BASE}/${taskId}/comments`);
  }

  addComment(taskId: number, payload: AddCommentRequest): Observable<ApiResponse<TaskComment>> {
    return this.apiService.post<TaskComment>(`${BASE}/${taskId}/comments`, payload);
  }

  addAttachments(taskId: number, files: File[]): Observable<ApiResponse<TaskAttachment[]>> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f, f.name));
    return this.http
      .post<ApiResponse<TaskAttachment[]>>(`${this.baseUrl}${BASE}/${taskId}/attachments`, formData)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }
}
