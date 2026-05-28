import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TaskManagementService } from './services/task-management.service';
import { DeleteModel, PaginationComponent, Button, ButtonInputConfig, SearchBarComponent, TaskViewModal } from '@common';
import { TaskAddeditModal } from './components/task-addedit-modal/task-addedit-modal';
import { ProjectList, ProjectCard } from './components/project-list/project-list';
import { createDeleteConfig } from '../../../common/components/delete-model/delete-model.config';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';
import { Task, TeamMember, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, CreateTaskRequest, UpdateTaskRequest, ProjectCardData } from './models/task-management.model';

@Component({
  selector: 'app-task-management',
  imports: [CommonModule, DeleteModel, TaskAddeditModal, PaginationComponent, Button, SearchBarComponent, ProjectList, TaskViewModal],
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

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  ngOnInit(): void {
    this.initButtonConfigs();

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
  }

  private loadProjectCards(): void {
    this.isProjectsLoading = true;
    this.taskService.getMyProjectsFull().subscribe({
      next: (res) => {
        const raw: ProjectCardData[] = res.data ?? [];
        this.projectCards = raw.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          projectStatus: p.projectStatus as any,
          startDate: p.startDate,
          endDate: p.endDate,
        }));
        this.isProjectsLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isProjectsLoading = false;
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
    this.taskService
      .getAll(
        { pageNumber: this.currentPage, pageSize: this.itemsPerPage, search: this.searchTerm || undefined },
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
    this.hideTooltip();
    this.closeDropdown();
    if (action === 'view') this.openViewModal(task);
    if (action === 'edit') this.openEditModal(task);
    else if (action === 'delete') this.openDeleteModal(task);
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