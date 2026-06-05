import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MyTaskService } from './services/my-task.service';
import { MyTask, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, MyTaskFilterParams } from './models/my-task.model';
import { TASK_STATUS_LIST, TASK_PRIORITY_LIST } from '../../team-lead/task-management/models/task-management.model';
import { TaskDetailModel } from './components/task-detail-model/task-detail-model';
import { PaginationComponent, ProjectList, SearchBarComponent, FilterPanel, FilterPanelConfig, FilterValues, Button, ButtonInputConfig } from '@common';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';
import { ProjectCard } from '../../../modules/team-lead/task-management/models/task-management.model';

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, TaskDetailModel, PaginationComponent, ProjectList, SearchBarComponent, FilterPanel, Button],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  private myTaskService = inject(MyTaskService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  view: 'projects' | 'tasks' = 'projects';
  selectedProjectId: string | null = null;
  selectedProjectName: string = '';

  projectCards: ProjectCard[] = [];
  isProjectsLoading = false;

  tasks: MyTask[] = [];
  isLoading = false;

  searchTerm = '';

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  selectedTask: MyTask | null = null;
  showDetailModal = false;

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly TaskStatuses = TaskStatuses;
  readonly TaskPriority = TaskPriority;

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  // Filter panel
  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  filterConfig!: FilterPanelConfig;
  filterBtnConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.buildFilterConfig();
    this.initButtonConfigs();

    this.route.queryParams.subscribe(params => {
      const pid   = params['projectId'];
      const pname = params['projectName'];
      if (pid) {
        this.selectedProjectId   = pid;
        this.selectedProjectName = pname ?? '';
        this.view = 'tasks';
        this.loadTasks();
      } else {
        this.view = 'projects';
        this.selectedProjectId   = null;
        this.selectedProjectName = '';
        this.loadProjectList();
      }
    });
  }

  private initButtonConfigs(): void {
    this.filterBtnConfig = {
      variant: 'filter',
      text: 'Filter',
      onClick: (event: MouseEvent) => {
        event?.stopPropagation();
        this.isFilterOpen = true;
      }
    };
  }

  private buildFilterConfig(): void {
    this.filterConfig = {
      fields: [
        {
          key: 'status',
          label: null,
          type: 'select',
          placeholder: 'Task Status',
          options: TASK_STATUS_LIST,
        },
        {
          key: 'priority',
          label: null,
          type: 'select',
          placeholder: 'Task Priority',
          options: TASK_PRIORITY_LIST,
        },
        {
          key: 'dueDateFrom',
          label: 'From',
          type: 'date',
        },
        {
          key: 'dueDateTo',
          label: 'To',
          type: 'date',
        },
      ],
      onFilter: (values: FilterValues) => {
        this.activeFilterValues = values;
        this.currentPage = 1;
        this.isFilterOpen = false;
        this.loadTasks();
      },
      onCancel: () => {
        this.activeFilterValues = null;
        this.currentPage = 1;
        this.isFilterOpen = false;
        this.loadTasks();
      },
    };
  }

  private buildFilterParams(): MyTaskFilterParams {
    const params: MyTaskFilterParams = {
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
      search: this.searchTerm.trim() || undefined,
    };

    if (this.activeFilterValues) {
      const statusVal = this.activeFilterValues['status'];
      if (statusVal != null && statusVal !== '') params.Status = String(statusVal);

      const priorityVal = this.activeFilterValues['priority'];
      if (priorityVal != null && priorityVal !== '') params.Priority = String(priorityVal);

      const fromDate = this.activeFilterValues['dueDateFrom'];
      if (fromDate != null && fromDate !== '') params.DueDateFrom = fromDate as string;

      const toDate = this.activeFilterValues['dueDateTo'];
      if (toDate != null && toDate !== '') params.DueDateTo = toDate as string;
    }

    return params;
  }

  private loadProjectList(): void {
    this.isProjectsLoading = true;
    this.myTaskService.getMyProjects().subscribe({
      next: (res) => {
        this.projectCards = res.data ?? [];
        this.isProjectsLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isProjectsLoading = false;
      },
    });
  }

  private loadTasks(): void {
    if (!this.selectedProjectId) return;
    this.isLoading = true;
    const filters = this.buildFilterParams();
    this.myTaskService.getMyTasks(filters, this.selectedProjectId).subscribe({
      next: (res) => {
        const paged = res.data;
        this.tasks      = paged?.items ?? [];
        this.totalItems = paged?.totalCount ?? 0;
        this.isLoading  = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isLoading = false;
      },
    });
  }

  onProjectSelected(project: ProjectCard): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { projectId: project.id, projectName: project.name },
      queryParamsHandling: 'merge',
    });
  }

  goBackToProjects(): void {
    this.searchTerm = '';
    this.activeFilterValues = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { projectId: null, projectName: null },
      queryParamsHandling: 'merge',
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
    this.currentPage  = 1;
    this.loadTasks();
  }

  openTaskDetail(task: MyTask): void {
    this.selectedTask   = task;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTask = null;
  }

  onTaskRefresh(): void {
    this.loadTasks();
  }

  getStatusLabel(status: TaskStatuses): string {
    return this.statusLabels[status] ?? '—';
  }

  getPriorityLabel(priority: TaskPriority): string {
    return this.priorityLabels[priority] ?? '—';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  isDueSoon(dateStr: string): boolean {
    const due = new Date(dateStr);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    return diffMs > 0 && diffMs < 3 * 24 * 60 * 60 * 1000;
  }

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  showTooltip(event: MouseEvent, text: string): void {
    this.tooltip = { visible: true, text, x: event.clientX, y: event.clientY };
  }
  moveTooltip(event: MouseEvent): void {
    this.tooltip.x = event.clientX;
    this.tooltip.y = event.clientY;
  }
  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  private getError(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message ?? 'Something went wrong.';
  }
}