import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../../../team-lead/task-management/models/task-management.model';
import { TaskComment, TaskAttachment } from '../../../../employee/my-tasks/models/my-task.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-task-view-modal',
  imports: [CommonModule],
  templateUrl: './task-view-modal.html',
  styleUrl: './task-view-modal.css',
})
export class TaskViewModal implements OnChanges {
  @Input() visible = false;
  @Input() task: Task | null = null;
  @Output() closed = new EventEmitter<void>();

  activeTab: 'comments' | 'attachments' = 'comments';

  comments: TaskComment[] = [];
  attachments: TaskAttachment[] = [];

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly resourceUrl = environment.resourceUrl;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.comments = (this.task.comments as unknown as TaskComment[]) ?? [];
      this.attachments = (this.task.attachments as unknown as TaskAttachment[]) ?? [];
      this.activeTab = 'comments';
    }
    if (changes['visible'] && !this.visible) {
      this.comments = [];
      this.attachments = [];
    }
  }

  setTab(tab: 'comments' | 'attachments'): void {
    this.activeTab = tab;
  }

  onClose(): void {
    this.closed.emit();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
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
      pdf: 'picture_as_pdf', doc: 'description', docx: 'description',
      xls: 'table_chart', xlsx: 'table_chart', txt: 'article',
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
    };
    return map[ext] ?? 'attach_file';
  }

  getAttachmentUrl(fileUrl: string): string {
    return `${this.resourceUrl}/uploads/Tasks/${fileUrl}`;
  }
}