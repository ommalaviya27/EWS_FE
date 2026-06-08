import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TaskManagementService } from './services/task-management.service';
import { DeleteModel, PaginationComponent, Button, ButtonInputConfig, SearchBarComponent, TaskViewModal, ProjectList, FilterPanel, FilterPanelConfig, FilterValues } from '@common';
import { TaskAddeditModal } from './components/task-addedit-modal/task-addedit-modal';
import { createDeleteConfig } from '../../../common/components/delete-model/delete-model.config';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';
import { Task, TeamMember, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_LIST, TASK_PRIORITY_LIST, CreateTaskRequest, UpdateTaskRequest, ProjectCardData, ProjectCard } from './models/task-management.model';

@Component({
  selector: 'app-task-management',
  imports: [CommonModule, DeleteModel, TaskAddeditModal, PaginationComponent, Button, SearchBarComponent, ProjectList, TaskViewModal, FilterPanel],
  templateUrl: './task-management.html',
  styleUrl: './task-management.css',
})
export class TaskManagement implements OnInit {
  private taskService = inject(TaskManagementService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  view: 'projects' | 'tasks' = 'projects';
  selectedProjectId: string | null = null;
  selectedProjectName: string = '';

  projectCards: ProjectCard[] = [];
  isProjectsLoading = false;
  projectSearchTerm = '';
  projectCurrentPage = DEFAULT_PAGINATION.currentPage;
  projectItemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  projectTotalItems = DEFAULT_PAGINATION.totalItems;

  tasks: Task[] = [];
  teamMembers: TeamMember[] = [];

  isLoading = false;
  isModalLoading = false;
  isDeleteLoading = false;

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  searchTerm = '';

  showModal = false;
  selectedTask: Task | null = null;

  showViewModal = false;
  viewTask: Task | null = null;

  showDeleteModal = false;
  deleteConfig = createDeleteConfig('');
  taskToDeleteId: number | null = null;

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly TaskStatuses = TaskStatuses;
  readonly TaskPriority = TaskPriority;

  activeDropdownId: number | null = null;

  createTaskBtnConfig!: ButtonInputConfig;
  filterBtnConfig!: ButtonInputConfig;

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  filterConfig!: FilterPanelConfig;

  ngOnInit(): void {
    this.initButtonConfigs();
    this.buildFilterConfig();

    this.route.queryParams.subscribe(params => {
      const pid = params['projectId'];
      const pname = params['projectName'];
      if (pid) {
        this.selectedProjectId = pid;
        this.selectedProjectName = pname ?? '';
        this.view = 'tasks';
        this.loadTasks();
        this.loadTeamMembers();
      } else {
        this.view = 'projects';
        this.loadProjectCards();
      }
    });
  }

  private initButtonConfigs(): void {
    this.createTaskBtnConfig = {
      variant: 'add',
      text: '+ Add',
      onClick: (event: MouseEvent) => {
        event?.stopPropagation();
        this.openAddModal();
      }
    };
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

  private loadProjectCards(): void {
    this.isProjectsLoading = true;
    this.taskService.getMyProjectsFull(
      this.projectCurrentPage,
      this.projectItemsPerPage,
      this.projectSearchTerm || undefined
    ).subscribe({
      next: (res) => {
        const paged = res.data;
        const raw: ProjectCardData[] = paged?.items ?? [];
        this.projectCards = raw.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          projectStatus: p.projectStatus as any,
          startDate: p.startDate,
          endDate: p.endDate,
        }));
        this.projectTotalItems = paged?.totalCount ?? 0;
        this.isProjectsLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isProjectsLoading = false;
      },
    });
  }

  onProjectSearchChange(term: string): void {
    this.projectSearchTerm = term;
    this.projectCurrentPage = 1;
    this.loadProjectCards();
  }

  onProjectPageChange(page: number): void {
    this.projectCurrentPage = page;
    this.loadProjectCards();
  }

  onProjectPageSizeChange(size: number): void {
    this.projectItemsPerPage = size;
    this.projectCurrentPage = 1;
    this.loadProjectCards();
  }

  onProjectSelected(project: ProjectCard): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { projectId: project.id, projectName: project.name },
      queryParamsHandling: 'merge',
    });
  }

  goBackToProjects(): void {
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

  private loadTasks(): void {
    this.isLoading = true;
    const extraParams: Record<string, string> = {};

    if (this.activeFilterValues) {
      if (this.activeFilterValues['status'] != null && this.activeFilterValues['status'] !== '') {
        extraParams['Status'] = this.activeFilterValues['status'].toString();
      }
      if (this.activeFilterValues['priority'] != null && this.activeFilterValues['priority'] !== '') {
        extraParams['Priority'] = this.activeFilterValues['priority'].toString();
      }
      if (this.activeFilterValues['dueDateFrom'] != null && this.activeFilterValues['dueDateFrom'] !== '') {
        extraParams['DueDateFrom'] = this.activeFilterValues['dueDateFrom'].toString();
      }
      if (this.activeFilterValues['dueDateTo'] != null && this.activeFilterValues['dueDateTo'] !== '') {
        extraParams['DueDateTo'] = this.activeFilterValues['dueDateTo'].toString();
      }
    }

    this.taskService
      .getAll(
        { pageNumber: this.currentPage, pageSize: this.itemsPerPage, search: this.searchTerm || undefined, ...extraParams } as any,
        this.selectedProjectId ?? undefined
      )
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

  private loadTeamMembers(): void {
    this.taskService.getTeamMembers().subscribe({
      next: (res) => (this.teamMembers = res.data ?? []),
      error: (err) => this.toastr.error(this.getErrorMessage(err)),
    });
  }

  onPageChange(page: number): void {
    this.closeDropdown();
    this.currentPage = page;
    this.loadTasks();
  }

  onPageSizeChange(size: number): void {
    this.closeDropdown();
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadTasks();
  }

  toggleDropdown(event: MouseEvent, taskId: number): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === taskId ? null : taskId;
  }

  closeDropdown(): void {
    this.activeDropdownId = null;
  }

  onActionClick(event: MouseEvent, action: 'view' | 'edit' | 'delete', task: Task): void {
    event.stopPropagation();
    this.closeDropdown();

    if (action === 'view') {
      this.openViewModal(task);
    } else if (action === 'edit') {
      this.openEditModal(task);
    } else if (action === 'delete') {
      this.openDeleteModal(task);
    }
  }

  openAddModal(): void {
    this.selectedTask = null;
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.selectedTask = task;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTask = null;
  }

  onSave(payload: CreateTaskRequest | UpdateTaskRequest): void {
    this.isModalLoading = true;
    const isEdit = !!this.selectedTask;
    const request$ = isEdit
      ? this.taskService.update(this.selectedTask!.id, payload as UpdateTaskRequest)
      : this.taskService.create(payload as CreateTaskRequest);

    request$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isModalLoading = false;
        this.closeModal();
        this.loadTasks();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isModalLoading = false;
      },
    });
  }

  openDeleteModal(task: Task): void {
    this.taskToDeleteId = task.id;
    this.deleteConfig = createDeleteConfig(task.title);
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.taskToDeleteId = null;
  }

  onConfirmDelete(): void {
    if (!this.taskToDeleteId) return;
    this.isDeleteLoading = true;
    this.taskService.delete(this.taskToDeleteId).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isDeleteLoading = false;
        this.closeDeleteModal();
        if (this.tasks.length === 1 && this.currentPage > 1) this.currentPage--;
        this.loadTasks();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isDeleteLoading = false;
      },
    });
  }

  openViewModal(task: Task): void {
    this.viewTask = task;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewTask = null;
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

  getStatusLabel(status: TaskStatuses): string { return this.statusLabels[status] ?? '—'; }
  getPriorityLabel(priority: TaskPriority): string { return this.priorityLabels[priority] ?? '—'; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private getErrorMessage(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message;
  }
}