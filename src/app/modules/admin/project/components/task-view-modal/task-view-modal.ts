import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../../../team-lead/task-management/models/task-management.model';
import { TaskComment, TaskAttachment } from '../../../../employee/my-tasks/models/my-task.model';
import { MyTaskService } from '../../../../employee/my-tasks/services/my-task.service';
import { PaginationComponent } from '../../../../../common/components/pagination/pagination';
import { environment } from '../../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { API_ROUTES } from '../../../../../common/constants/api-routes';

const MODAL_PAGE_SIZE = 5;

@Component({
  selector: 'app-task-view-modal',
  imports: [CommonModule, PaginationComponent],
  templateUrl: './task-view-modal.html',
  styleUrl: './task-view-modal.css',
})
export class TaskViewModal implements OnChanges {
  @Input() visible = false;
  @Input() task: Task | null = null;
  @Output() closed = new EventEmitter<void>();

  private myTaskService = inject(MyTaskService);
  private toastr = inject(ToastrService);

  activeTab: 'comments' | 'attachments' = 'comments';

  comments: TaskComment[] = [];
  commentPage = 1;
  commentTotalItems = 0;
  readonly commentPageSize = MODAL_PAGE_SIZE;
  isLoadingComments = false;

  attachments: TaskAttachment[] = [];
  attachmentPage = 1;
  attachmentTotalItems = 0;
  readonly attachmentPageSize = MODAL_PAGE_SIZE;
  isLoadingAttachments = false;

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly resourceUrl = environment.resourceUrl;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.activeTab = 'comments';
      this.commentPage = 1;
      this.attachmentPage = 1;
      this.loadComments();
      this.loadAttachments();
    }
    if (changes['visible'] && !this.visible) {
      this.comments = [];
      this.attachments = [];
      this.commentTotalItems = 0;
      this.attachmentTotalItems = 0;
    }
  }

  setTab(tab: 'comments' | 'attachments'): void {
    this.activeTab = tab;
  }

  private loadComments(): void {
    if (!this.task) return;
    this.isLoadingComments = true;
    this.myTaskService.getComments(this.task.id, this.commentPage, this.commentPageSize).subscribe({
      next: (res) => {
        this.comments = res.data?.items ?? [];
        this.commentTotalItems = res.data?.totalCount ?? 0;
        this.isLoadingComments = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isLoadingComments = false;
      },
    });
  }

  onCommentPageChange(page: number): void {
    this.commentPage = page;
    this.loadComments();
  }

  private loadAttachments(): void {
    if (!this.task) return;
    this.isLoadingAttachments = true;
    this.myTaskService
      .getAttachments(this.task.id, this.attachmentPage, this.attachmentPageSize)
      .subscribe({
        next: (res) => {
          this.attachments = res.data?.items ?? [];
          this.attachmentTotalItems = res.data?.totalCount ?? 0;
          this.isLoadingAttachments = false;
        },
        error: (err) => {
          this.toastr.error(this.getError(err));
          this.isLoadingAttachments = false;
        },
      });
  }

  onAttachmentPageChange(page: number): void {
    this.attachmentPage = page;
    this.loadAttachments();
  }

  onClose(): void {
    this.closed.emit();
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

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      xls: 'table_chart',
      xlsx: 'table_chart',
      txt: 'article',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
    };
    return map[ext] ?? 'attach_file';
  }

  getAttachmentUrl(attachment: TaskAttachment): string {
    return `${this.resourceUrl}${API_ROUTES.MY_TASKS.DOWNLOAD_ATTACHMENT(attachment.id)}`;
  }

  private getError(err: any): string {
    const b = err?.error;
    if (b?.errorMessages?.length) return b.errorMessages.join(' ');
    return b?.message ?? 'Something went wrong.';
  }
}