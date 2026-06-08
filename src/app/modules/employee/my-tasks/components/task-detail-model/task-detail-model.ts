import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MyTask, TaskComment, TaskAttachment, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../models/my-task.model';
import { MyTaskService } from '../../services/my-task.service';
import { ConfirmationModel } from '../../../../../common/components/confirmation-model/confirmation-model';
import { ConfirmationModelConfig } from '../../../../../common/components/confirmation-model/confirmation-model.config';
import { Description, DescriptionFieldConfig, Button, ButtonInputConfig } from '@common';
import { PaginationComponent } from '../../../../../common/components/pagination/pagination';
import { SessionService } from 'src/app/common/services';

const MODAL_PAGE_SIZE = 5;

@Component({
  selector: 'app-task-detail-model',
  imports: [ CommonModule, FormsModule, ReactiveFormsModule, ConfirmationModel, Description, Button, PaginationComponent ],
  templateUrl: './task-detail-model.html',
  styleUrl: './task-detail-model.css',
})
export class TaskDetailModel implements OnChanges {
  @Input() visible = false;
  @Input() task: MyTask | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() refreshTasks = new EventEmitter<void>();

  private myTaskService = inject(MyTaskService);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  activeTab: 'details' | 'comments' | 'attachments' = 'details';

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

  commentForm!: FormGroup;
  editCommentForm!: FormGroup;

  readonly addCommentConfig: DescriptionFieldConfig = {
    formControlName: 'comment',
    placeholder: 'Write a comment...',
    rows: 1,
  };

  readonly editCommentConfig: DescriptionFieldConfig = {
    formControlName: 'editComment',
    placeholder: 'Edit comment...',
    rows: 1,
  };

  postCommentConfig: ButtonInputConfig = {
    variant: 'save',
    text: 'Post',
    isLoading: false,
    disabled: false,
    onClick: () => this.submitComment(),
  };

  uploadFilesConfig: ButtonInputConfig = {
    variant: 'save',
    text: 'Upload',
    isLoading: false,
    disabled: false,
    onClick: () => this.uploadFiles(),
  };

  getSaveEditConfig(comment: TaskComment): ButtonInputConfig {
    return {
      variant: 'save',
      text: 'Save',
      isLoading: this.isSavingEdit,
      disabled: this.editCommentForm.invalid || this.isSavingEdit,
      onClick: () => this.saveEdit(comment),
    };
  }

  cancelEditConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Cancel',
    onClick: () => this.cancelEdit(),
  };

  isSubmittingComment = false;
  editingCommentId: number | null = null;
  isSavingEdit = false;
  deletingCommentId: number | null = null;
  openMenuCommentId: number | null = null;

  selectedFiles: File[] = [];
  isUploadingFiles = false;
  deletingAttachmentId: number | null = null;
  downloadingAttachmentId: number | null = null;

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly TaskStatuses = TaskStatuses;
  readonly TaskPriority = TaskPriority;

  get currentUserId(): number {
    return this.sessionService.userId ?? 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.task) {
      this.activeTab = 'details';
      this.selectedFiles = [];
      this.commentPage = 1;
      this.attachmentPage = 1;
      this.cancelEdit();
      this.currentStatus = this.task.taskStatus;
      this.loadComments();
      this.loadAttachments();
      this.commentForm = this.fb.group({
        comment: ['', [Validators.required, Validators.maxLength(1000)]],
      });
      this.editCommentForm = this.fb.group({
        editComment: ['', [Validators.required, Validators.maxLength(1000)]],
      });
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
      next: (res) => {
        this.currentStatus = newStatus;
        this.task = { ...this.task!, taskStatus: newStatus };
        this.toastr.success(res.message);
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
    this.cancelEdit();
    this.loadComments();
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.task) return;
    const text = this.commentForm.value.comment.trim();
    if (!text) return;
    this.isSubmittingComment = true;
    this.postCommentConfig = { ...this.postCommentConfig, isLoading: true, disabled: true };
    this.myTaskService.addComment(this.task.id, { comment: text }).subscribe({
      next: (res) => {
        this.commentForm.reset();
        this.isSubmittingComment = false;
        this.postCommentConfig = { ...this.postCommentConfig, isLoading: false, disabled: false };
        const newTotal = this.commentTotalItems + 1;
        this.commentPage = Math.ceil(newTotal / this.commentPageSize);
        this.loadComments();
        this.toastr.success(res.message);
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isSubmittingComment = false;
        this.postCommentConfig = { ...this.postCommentConfig, isLoading: false, disabled: false };
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
    this.editCommentForm.patchValue({ editComment: comment.comment });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentForm?.reset();
    this.isSavingEdit = false;
    this.cancelEditConfig = { ...this.cancelEditConfig, disabled: false };
  }

  saveEdit(comment: TaskComment): void {
    if (this.editCommentForm.invalid) return;
    const text = this.editCommentForm.value.editComment.trim();
    if (!text) return;
    this.isSavingEdit = true;
    this.myTaskService
      .updateComment(comment.id, { taskId: comment.taskId, comment: text })
      .subscribe({
        next: (res) => {
          this.cancelEdit();
          this.loadComments();
          this.toastr.success(res.message);
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
      next: (res) => {
        this.deletingCommentId = null;
        this.toastr.success(res.message);
        const remaining = this.commentTotalItems - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / this.commentPageSize));
        if (this.commentPage > maxPage) this.commentPage = maxPage;
        this.loadComments();
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.deletingCommentId = null;
      },
    });
  }

  isOwnComment(c: TaskComment): boolean {
    return c.userId === this.currentUserId;
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
    this.uploadFilesConfig = { ...this.uploadFilesConfig, isLoading: true, disabled: true };
    this.myTaskService.addAttachments(this.task.id, this.selectedFiles).subscribe({
      next: (res) => {
        this.selectedFiles = [];
        this.isUploadingFiles = false;
        this.uploadFilesConfig = { ...this.uploadFilesConfig, isLoading: false, disabled: false };
        this.toastr.success(res.message);
        this.refreshTasks.emit();
        const newTotal = this.attachmentTotalItems + 1;
        this.attachmentPage = Math.ceil(newTotal / this.attachmentPageSize);
        this.loadAttachments();
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isUploadingFiles = false;
        this.uploadFilesConfig = { ...this.uploadFilesConfig, isLoading: false, disabled: false };
      },
    });
  }

  downloadAttachment(a: TaskAttachment): void {
    this.downloadingAttachmentId = a.id;
    try {
      this.myTaskService.downloadAttachment(a.id, a.fileName);
    } finally {
      setTimeout(() => (this.downloadingAttachmentId = null), 1500);
    }
  }

  deleteAttachment(a: TaskAttachment): void {
    this.deletingAttachmentId = a.id;
    this.myTaskService.deleteAttachment(a.id).subscribe({
      next: (res) => {
        this.deletingAttachmentId = null;
        this.toastr.success(res.message);
        this.refreshTasks.emit();
        const remaining = this.attachmentTotalItems - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / this.attachmentPageSize));
        if (this.attachmentPage > maxPage) this.attachmentPage = maxPage;
        this.loadAttachments();
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