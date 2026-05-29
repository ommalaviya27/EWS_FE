import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MyTaskService } from './services/my-task.service';
import { MyTask, TaskStatuses, TaskPriority, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from './models/my-task.model';
import { TaskDetailModel } from './components/task-detail-model/task-detail-model';
import { PaginationComponent, ProjectList, SearchBarComponent } from '@common';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';
import { ProjectCard } from '../../../modules/team-lead/task-management/models/task-management.model';

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, TaskDetailModel, PaginationComponent, ProjectList, SearchBarComponent],
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

  private allProjectTasks: MyTask[] = [];  
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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const pid   = params['projectId'];
      const pname = params['projectName'];
      if (pid) {
        this.selectedProjectId   = pid;
        this.selectedProjectName = pname ?? '';
        this.view = 'tasks';
        this.loadTasksForProject(pid);
      } else {
        this.view = 'projects';
        this.selectedProjectId   = null;
        this.selectedProjectName = '';
        this.loadProjectList();
      }
    });
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

  onProjectSelected(project: ProjectCard): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { projectId: project.id, projectName: project.name },
      queryParamsHandling: 'merge',
    });
  }

  goBackToProjects(): void {
    this.searchTerm = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { projectId: null, projectName: null },
      queryParamsHandling: 'merge',
    });
  }

  private loadTasksForProject(projectId: string): void {
    this.isLoading = true;
    this.myTaskService.getMyTasks(projectId).subscribe({
      next: (res) => {
        this.allProjectTasks = res.data ?? [];
        this.currentPage = 1;
        this.applySearchAndPaginate();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isLoading = false;
      },
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applySearchAndPaginate();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applySearchAndPaginate();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage  = 1;
    this.applySearchAndPaginate();
  }

  private applySearchAndPaginate(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = term
      ? this.allProjectTasks.filter(t =>
          t.title.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term)
        )
      : this.allProjectTasks;

    this.totalItems = filtered.length;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.tasks = filtered.slice(start, start + this.itemsPerPage);
  }

  openTaskDetail(task: MyTask): void {
    this.selectedTask  = task;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTask = null;
  }

  onTaskRefresh(): void {
    if (this.selectedProjectId) {
      this.loadTasksForProject(this.selectedProjectId);
    }
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