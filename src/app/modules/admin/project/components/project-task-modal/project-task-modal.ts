import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Task, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../../../team-lead/task-management/models/task-management.model';
import { PaginationComponent, SearchBarComponent } from '@common';
import { DEFAULT_PAGINATION } from '../../../../../common/constants/app.constants';
import { TaskViewModal } from '../task-view-modal/task-view-modal';

@Component({
  selector: 'app-project-tasks-modal',
  imports: [CommonModule, PaginationComponent, SearchBarComponent, TaskViewModal],
  templateUrl: './project-task-modal.html',
  styleUrl: './project-task-modal.css',
})
export class ProjectTasksModal implements OnChanges {
  @Input() visible = false;
  @Input() project: Project | null = null;
  @Output() closed = new EventEmitter<void>();

  private projectService = inject(ProjectService);
  private toastr = inject(ToastrService);

  tasks: Task[] = [];
  isLoading = false;

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;
  searchTerm = '';

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly TaskStatuses = TaskStatuses;
  readonly TaskPriority = TaskPriority;

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  showTaskViewModal = false;
  selectedTask: Task | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible && this.project) {
        this.resetAndLoad();
      } else if (!this.visible) {
        this.resetState();
      }
    }

    if (changes['project'] && this.visible && this.project) {
      this.resetAndLoad();
    }
  }

  private resetAndLoad(): void {
    this.currentPage = DEFAULT_PAGINATION.currentPage;
    this.itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
    this.totalItems = DEFAULT_PAGINATION.totalItems;
    this.searchTerm = '';
    this.tasks = [];
    this.loadTasks();
  }

  private resetState(): void {
    this.tasks = [];
    this.searchTerm = '';
    this.currentPage = DEFAULT_PAGINATION.currentPage;
    this.totalItems = DEFAULT_PAGINATION.totalItems;
  }

  private loadTasks(): void {
    if (!this.project) return;
    this.isLoading = true;

    this.projectService
      .getProjectTasks(this.project.id, {
        pageNumber: this.currentPage,
        pageSize: this.itemsPerPage,
        search: this.searchTerm || undefined,
      } as any)
      .subscribe({
        next: (res) => {
          this.tasks = res.data?.items ?? [];
          this.totalItems = res.data?.totalCount ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(this.getErrorMessage(err));
          this.isLoading = false;
        },
      });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadTasks();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTasks();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadTasks();
  }

  openTaskView(task: Task): void {
    this.selectedTask = task;
    this.showTaskViewModal = true;
  }

  closeTaskView(): void {
    this.showTaskViewModal = false;
    this.selectedTask = null;
  }

  onClose(): void {
    this.closed.emit();
  }

  showTooltip(event: MouseEvent, text: string): void {
    if (!text?.trim()) return;
    this.tooltip = { visible: true, text, x: event.clientX, y: event.clientY };
  }

  moveTooltip(event: MouseEvent): void {
    this.tooltip.x = event.clientX;
    this.tooltip.y = event.clientY;
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  isOverdue(task: Task): boolean {
    return (
      task.taskStatus !== TaskStatuses.Completed &&
      new Date(task.dueDate) < new Date()
    );
  }

  private getErrorMessage(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message ?? 'An error occurred.';
  }
}