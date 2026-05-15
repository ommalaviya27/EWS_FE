import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from './services/project.service';
import { DeleteModel, PaginationComponent } from '@common';
import { ProjectAddeditModal } from './components/project-addedit-modal/project-addedit-modal';
import { createDeleteConfig } from '../../../common/components/delete-model/delete-model.config';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';
import { Project, TeamLeader, ProjectStatus, PROJECT_STATUS_LABELS, CreateProjectRequest, UpdateProjectRequest } from './models/project.model';

@Component({
  selector: 'app-project',
  imports: [CommonModule, DeleteModel, ProjectAddeditModal, PaginationComponent],
  templateUrl: './project.html',
  styleUrl: './project.css',
  host: {
    style: 'display: flex; flex-direction: column; flex: 1; min-height: 0; min-width: 0; overflow: hidden;'
  }
})
export class ProjectModule implements OnInit {
  private projectService = inject(ProjectService);
  private toastr = inject(ToastrService);

  projects: Project[] = [];
  teamLeaders: TeamLeader[] = [];

  isLoading = false;
  isModalLoading = false;
  isDeleteLoading = false;

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  showModal = false;
  selectedProject: Project | null = null;

  showDeleteModal = false;
  deleteConfig = createDeleteConfig('');
  projectToDeleteId: string | null = null;

  readonly statusLabels = PROJECT_STATUS_LABELS;
  readonly ProjectStatus = ProjectStatus;

  /* ===== Tooltip state ===== */
  tooltip = { visible: false, text: '', x: 0, y: 0 };

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

  ngOnInit(): void {
    this.loadProjects();
    this.loadTeamLeaders();
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.projectService.getAll({ pageNumber: this.currentPage, pageSize: this.itemsPerPage }).subscribe({
      next: (res) => {
        this.projects = res.data?.items ?? [];
        this.totalItems = res.data?.totalCount ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isLoading = false;
      },
    });
  }

  private loadTeamLeaders(): void {
    this.projectService.getTeamLeaders().subscribe({
      next: (res) => (this.teamLeaders = res.data ?? []),
      error: (err) => this.toastr.error(this.getErrorMessage(err)),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProjects();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadProjects();
  }

  openAddModal(): void {
    this.selectedProject = null;
    this.showModal = true;
  }

  openEditModal(project: Project): void {
    this.selectedProject = project;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProject = null;
  }

  onSave(payload: CreateProjectRequest | UpdateProjectRequest): void {
    this.isModalLoading = true;
    const isEdit = !!this.selectedProject;
    const request$ = isEdit
      ? this.projectService.update(this.selectedProject!.id, payload as UpdateProjectRequest)
      : this.projectService.create(payload as CreateProjectRequest);

    request$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isModalLoading = false;
        this.closeModal();
        this.loadProjects();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isModalLoading = false;
      },
    });
  }

  openDeleteModal(project: Project): void {
    this.projectToDeleteId = project.id;
    this.deleteConfig = createDeleteConfig(project.name);
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.projectToDeleteId = null;
  }

  onConfirmDelete(): void {
    if (!this.projectToDeleteId) return;
    this.isDeleteLoading = true;
    this.projectService.delete(this.projectToDeleteId).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isDeleteLoading = false;
        this.closeDeleteModal();
        if (this.projects.length === 1 && this.currentPage > 1) this.currentPage--;
        this.loadProjects();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isDeleteLoading = false;
      },
    });
  }

  getTeamLeaderName(userId: number): string {
    return this.teamLeaders.find((t) => t.userId === userId)?.name ?? '—';
  }

  getStatusLabel(status: ProjectStatus): string {
    return this.statusLabels[status] ?? '—';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private getErrorMessage(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message;
  }
}