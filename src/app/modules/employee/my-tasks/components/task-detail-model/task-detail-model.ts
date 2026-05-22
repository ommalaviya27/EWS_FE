import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MyTask, TaskComment, TaskAttachment, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../models/my-task.model';
import { MyTaskService } from '../../services/my-task.service';
import { ConfirmationModel } from '../../../../../common/components/confirmation-model/confirmation-model';
import { ConfirmationModelConfig } from '../../../../../common/components/confirmation-model/confirmation-model.config';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-task-detail-model',
  imports: [CommonModule, FormsModule, ConfirmationModel],
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

  activeTab: 'details' | 'comments' | 'attachments' = 'details';

  comments: TaskComment[] = [];
  attachments: TaskAttachment[] = [];

  currentStatus: TaskStatuses = TaskStatuses.Pending;
  isUpdatingStatus = false;
  readonly allStatuses = Object.values(TaskStatuses).filter(
    (v) => typeof v === 'number'
  ) as TaskStatuses[];

  showStatusConfirm = false;
  pendingStatus: TaskStatuses | null = null;
  statusConfirmConfig: ConfirmationModelConfig = {
    title: 'Update Status',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Update',
  };

  commentText = '';
  isSubmittingComment = false;
  isLoadingComments = false;
  commentPage = 1;
  readonly commentPageSize = PAGE_SIZE;

  editingCommentId: number | null = null;
  editCommentText = '';
  isSavingEdit = false;
  deletingCommentId: number | null = null;
  openMenuCommentId: number | null = null;

  selectedFiles: File[] = [];
  isUploadingFiles = false;
  deletingAttachmentId: number | null = null;

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly TaskStatuses = TaskStatuses;
  readonly TaskPriority = TaskPriority;

  get currentUserId(): number {
    return this.task?.assignedToUserId ?? 0;
  }

  get totalCommentPages(): number {
    return Math.max(1, Math.ceil(this.comments.length / this.commentPageSize));
  }
  get pagedComments(): TaskComment[] {
    const start = (this.commentPage - 1) * this.commentPageSize;
    return this.comments.slice(start, start + this.commentPageSize);
  }
  get commentPageNumbers(): number[] {
    return Array.from({ length: this.totalCommentPages }, (_, i) => i + 1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.task) {
      this.activeTab = 'details';
      this.commentText = '';
      this.selectedFiles = [];
      this.commentPage = 1;
      this.cancelEdit();
      this.currentStatus = this.task.taskStatus;
      this.loadComments();
      this.attachments = this.task.attachments ?? [];
    }
  }

  setTab(tab: 'details' | 'comments' | 'attachments'): void {
    this.activeTab = tab;
    this.openMenuCommentId = null;
  }

  onStatusChange(event: Event): void {
    const newStatus = +(event.target as HTMLSelectElement).value as TaskStatuses;
    if (!this.task || newStatus === this.task.taskStatus) return;
    this.pendingStatus = newStatus;
    this.statusConfirmConfig = {
      title: 'Update Status',
      message: `Are you sure you want to change the status to "${this.getStatusLabel(newStatus)}"?`,
      cancelText: 'Cancel',
      confirmText: 'Update',
    };
    this.showStatusConfirm = true;
  }

  confirmStatusChange(): void {
    if (!this.task || this.pendingStatus === null) return;
    this.showStatusConfirm = false;
    const newStatus = this.pendingStatus;
    this.pendingStatus = null;
    this.isUpdatingStatus = true;
    this.myTaskService.updateTaskStatus(this.task.id, { status: newStatus }).subscribe({
      next: () => {
        this.currentStatus = newStatus;
        this.task = { ...this.task!, taskStatus: newStatus };
        this.toastr.success('Status updated.');
        this.isUpdatingStatus = false;
        this.refreshTasks.emit();
      },
      error: (err) => {
        this.currentStatus = this.task?.taskStatus ?? TaskStatuses.Pending;
        this.toastr.error(this.getError(err));
        this.isUpdatingStatus = false;
      },
    });
  }

  cancelStatusChange(): void {
    this.showStatusConfirm = false;
    if (this.task) {
      this.currentStatus = this.task.taskStatus;
    }
    this.pendingStatus = null;
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
        this.commentPage = this.totalCommentPages;
        this.toastr.success('Comment added.');
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isSubmittingComment = false;
      },
    });
  }

  toggleCommentMenu(id: number): void {
    this.openMenuCommentId = this.openMenuCommentId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuCommentId = null;
  }

  startEdit(comment: TaskComment): void {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.comment;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
    this.isSavingEdit = false;
  }

  saveEdit(comment: TaskComment): void {
    const text = this.editCommentText.trim();
    if (!text) return;
    this.isSavingEdit = true;
    this.myTaskService
      .updateComment(comment.id, { taskId: comment.taskId, comment: text })
      .subscribe({
        next: (res) => {
          this.comments = this.comments.map((c) => (c.id === comment.id ? res.data! : c));
          this.cancelEdit();
          this.toastr.success('Comment updated.');
        },
        error: (err) => {
          this.toastr.error(this.getError(err));
          this.isSavingEdit = false;
        },
      });
  }

  deleteComment(comment: TaskComment): void {
    this.deletingCommentId = comment.id;
    this.myTaskService.deleteComment(comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c.id !== comment.id);
        if (this.commentPage > this.totalCommentPages) this.commentPage = this.totalCommentPages;
        this.deletingCommentId = null;
        this.toastr.success('Comment deleted.');
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.deletingCommentId = null;
      },
    });
  }

  goToCommentPage(page: number): void {
    if (page >= 1 && page <= this.totalCommentPages) {
      this.commentPage = page;
      this.cancelEdit();
    }
  }

  isOwnComment(c: TaskComment): boolean {
    return c.userId === this.currentUserId;
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
        this.toastr.success('Files uploaded.');
        this.refreshTasks.emit();
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isUploadingFiles = false;
      },
    });
  }

  deleteAttachment(a: TaskAttachment): void {
    this.deletingAttachmentId = a.id;
    this.myTaskService.deleteAttachment(a.id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter((x) => x.id !== a.id);
        this.deletingAttachmentId = null;
        this.toastr.success('Attachment deleted.');
        this.refreshTasks.emit();
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.deletingAttachmentId = null;
      },
    });
  }

  formatFileSize(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  }
  formatDate(d: string): string {
    return d
      ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
  }
  formatDateTime(d: string): string {
    return d
      ? new Date(d).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';
  }
  getStatusLabel(s: TaskStatuses): string {
    return this.statusLabels[s] ?? '—';
  }
  getPriorityLabel(p: TaskPriority): string {
    return this.priorityLabels[p] ?? '—';
  }

  getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    return (
      (
        {
          pdf: 'picture_as_pdf',
          doc: 'description',
          docx: 'description',
          xls: 'table_chart',
          xlsx: 'table_chart',
          jpg: 'image',
          jpeg: 'image',
          png: 'image',
          txt: 'text_snippet',
        } as any
      )[ext ?? ''] ?? 'insert_drive_file'
    );
  }
  getFileColorClass(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'icon-pdf';
    if (['doc', 'docx'].includes(ext ?? '')) return 'icon-doc';
    if (['xls', 'xlsx'].includes(ext ?? '')) return 'icon-xls';
    if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) return 'icon-img';
    return 'icon-default';
  }

  onClose(): void {
    this.closed.emit();
  }
  private getError(err: any): string {
    const b = err?.error;
    if (b?.errorMessages?.length) return b.errorMessages.join(' ');
    return b?.message ?? 'Something went wrong.';
  }
}
