import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from './services/project.service';
import { DeleteModel, PaginationComponent, Button, ButtonInputConfig, SearchBarComponent, FilterPanel, FilterPanelConfig, FilterValues, createDeleteConfig } from '@common';
import { ProjectAddeditModal } from './components/project-addedit-modal/project-addedit-modal';
import { ProjectTasksModal } from './components/project-task-modal/project-task-modal';
import { DEFAULT_PAGINATION } from '@constants';
import { Project, TeamLeader, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_LIST, CreateProjectRequest, UpdateProjectRequest } from './models/project.model';

@Component({
  selector: 'app-project',
  imports: [CommonModule, DeleteModel, ProjectAddeditModal, ProjectTasksModal, PaginationComponent, Button, SearchBarComponent, FilterPanel],
  templateUrl: './project.html',
  styleUrl: './project.css'
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

  searchTerm = '';

  showModal = false;
  selectedProject: Project | null = null;

  showDeleteModal = false;
  deleteConfig = createDeleteConfig('');
  projectToDeleteId: string | null = null;

  showTasksModal = false;
  projectToView: Project | null = null;

  readonly statusLabels = PROJECT_STATUS_LABELS;
  readonly ProjectStatus = ProjectStatus;

  activeDropdownId: string | null = null;

  createProjectBtnConfig!: ButtonInputConfig;
  filterBtnConfig!: ButtonInputConfig;

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  filterConfig!: FilterPanelConfig;

  showTooltip(event: MouseEvent, text: string): void {
    this.tooltip = { visible: true, text, x: event.clientX, y: event.clientY };
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  ngOnInit(): void {
    this.initButtonConfigs();
    this.buildFilterConfig([]);
    this.loadTeamLeaders();
    this.loadProjects();
  }

  private initButtonConfigs(): void {
    this.createProjectBtnConfig = {
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

  private buildFilterConfig(leaders: TeamLeader[]): void {
    this.filterConfig = {
      fields: [
        {
          key: 'projectStatus',
          label: null,
          type: 'select',
          placeholder: 'Project Status',
          options: PROJECT_STATUS_LIST,
        },
        {
          key: 'reportingId',
          label: null,
          type: 'select',
          placeholder: 'Team Leads',
          options: leaders.map(tl => ({ value: tl.userId, label: tl.name })),
        },
        {
          key: 'startDate',
          label: 'From',
          type: 'date',
        },
        {
          key: 'endDate',
          label: 'To',
          type: 'date',
        },
      ],
      onFilter: (values: FilterValues) => {
        this.activeFilterValues = values;
        this.currentPage = 1;
        this.isFilterOpen = false;
        this.loadProjects();
      },
      onCancel: () => {
        this.activeFilterValues = null;
        this.currentPage = 1;
        this.isFilterOpen = false;
        this.loadProjects();
      },
    };
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadProjects();
  }

  private loadProjects(): void {
    this.isLoading = true;
    const params: Record<string, string> = {
      pageNumber: this.currentPage.toString(),
      pageSize: this.itemsPerPage.toString(),
    };

    if (this.searchTerm?.trim()) params['search'] = this.searchTerm.trim();

    if (this.activeFilterValues) {
      if (this.activeFilterValues['projectStatus'] != null && this.activeFilterValues['projectStatus'] !== '') {
        params['projectStatus'] = this.activeFilterValues['projectStatus'].toString();
      }
      if (this.activeFilterValues['reportingId'] != null && this.activeFilterValues['reportingId'] !== '') {
        params['reportingId'] = this.activeFilterValues['reportingId'].toString();
      }
      if (this.activeFilterValues['startDate'] != null && this.activeFilterValues['startDate'] !== '') {
        params['startDateFrom'] = this.activeFilterValues['startDate'].toString();
      }
      if (this.activeFilterValues['endDate'] != null && this.activeFilterValues['endDate'] !== '') {
        params['endDateTo'] = this.activeFilterValues['endDate'].toString();
      }
    }

    this.projectService
      .getAll(params as any)
      .subscribe({
        next: (res) => {
          this.projects = res.data?.items ?? [];
          this.totalItems = res.data?.totalCount ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err?.error?.message);
          this.isLoading = false;
        },
      });
  }

  private loadTeamLeaders(): void {
    this.projectService.getTeamLeaders().subscribe({
      next: (res) => {
        this.teamLeaders = res.data ?? [];
        this.buildFilterConfig(this.teamLeaders);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.buildFilterConfig([]);
      },
    });
  }

  onPageChange(page: number): void {
    this.closeDropdown();
    this.currentPage = page;
    this.loadProjects();
  }

  onPageSizeChange(size: number): void {
    this.closeDropdown();
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadProjects();
  }

  toggleDropdown(event: MouseEvent, projectId: string): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === projectId ? null : projectId;
  }

  closeDropdown(): void {
    this.activeDropdownId = null;
  }

  onActionClick(event: MouseEvent, action: 'view' | 'edit' | 'delete', project: Project): void {
    event.stopPropagation();
    this.closeDropdown();

    if (action === 'view') {
      this.openTasksModal(project);
    } else if (action === 'edit') {
      this.openEditModal(project);
    } else if (action === 'delete') {
      this.openDeleteModal(project);
    }
  }

  openTasksModal(project: Project): void {
    this.projectToView = project;
    this.showTasksModal = true;
  }

  closeTasksModal(): void {
    this.showTasksModal = false;
    this.projectToView = null;
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
        this.toastr.error(err?.error?.message);
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
        this.toastr.error(err?.error?.message);
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
}