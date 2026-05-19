import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MyTask, TaskComment, TaskAttachment, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../models/my-task.model';
import { MyTaskService } from '../../services/my-task.service';

@Component({
  selector: 'app-task-detail-model',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-model.html',
  styleUrl: './task-detail-model.css',
})
export class TaskDetailModel implements OnChanges {
  @Input() visible = false;
  @Input() task: MyTask | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() refreshTasks = new EventEmitter<void>();

  private myTaskService = inject(MyTaskService);
  private toastr = inject(ToastrService);

  activeTab: 'comments' | 'attachments' = 'comments';

  comments: TaskComment[] = [];
  attachments: TaskAttachment[] = [];

  commentText = '';
  isSubmittingComment = false;

  selectedFiles: File[] = [];
  isUploadingFiles = false;

  isLoadingComments = false;
  isLoadingAttachments = false;

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly TaskStatuses = TaskStatuses;
  readonly TaskPriority = TaskPriority;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.task) {
      this.activeTab = 'comments';
      this.commentText = '';
      this.selectedFiles = [];
      this.loadComments();
    }
  }

  setTab(tab: 'comments' | 'attachments'): void {
    this.activeTab = tab;
  }

  private loadComments(): void {
    if (!this.task) return;
    this.isLoadingComments = true;
    this.myTaskService.getComments(this.task.id).subscribe({
      next: (res) => {
        this.comments = res.data ?? [];
        this.isLoadingComments = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isLoadingComments = false;
      },
    });
  }

  submitComment(): void {
    const text = this.commentText.trim();
    if (!text || !this.task) return;
    this.isSubmittingComment = true;
    this.myTaskService.addComment(this.task.id, { comment: text }).subscribe({
      next: (res) => {
        this.comments = [...this.comments, res.data!];
        this.commentText = '';
        this.isSubmittingComment = false;
        this.toastr.success('Comment added.');
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isSubmittingComment = false;
      },
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFiles = Array.from(input.files);
    input.value = '';
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  uploadFiles(): void {
    if (!this.selectedFiles.length || !this.task) return;
    this.isUploadingFiles = true;
    this.myTaskService.addAttachments(this.task.id, this.selectedFiles).subscribe({
      next: (res) => {
        this.attachments = [...this.attachments, ...(res.data ?? [])];
        this.selectedFiles = [];
        this.isUploadingFiles = false;
        this.toastr.success('Files uploaded successfully.');
        this.refreshTasks.emit();
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isUploadingFiles = false;
      },
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(status: TaskStatuses): string {
    return this.statusLabels[status] ?? '—';
  }

  getPriorityLabel(priority: TaskPriority): string {
    return this.priorityLabels[priority] ?? '—';
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      xls: 'table_chart',
      xlsx: 'table_chart',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
    };
    return icons[ext ?? ''] ?? 'insert_drive_file';
  }

  onClose(): void {
    this.closed.emit();
  }

  private getError(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message ?? 'Something went wrong.';
  }
}