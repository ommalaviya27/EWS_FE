import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TeamLeadDashboardService } from '../dashboard/services/team-lead-dashboard.service';
import {
  TeamLeadDashboard,
  TaskPriority,
  TaskStatuses,
  ProjectStatus,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from '../dashboard/models/team-lead-dashboard.model';
import { ROUTES } from '../../../common/constants/route-paths';

@Component({
  selector: 'app-team-lead-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-lead-dashboard.html',
  styleUrls: ['./team-lead-dashboard.css'],
})
export class TeamLeadDashboardComponent implements OnInit {
  private dashboardService = inject(TeamLeadDashboardService);
  private toastr = inject(ToastrService);

  dashboard: TeamLeadDashboard | null = null;
  isLoading = false;

  // Pagination state for Recent Team Tasks
  currentPage = 1;
  readonly pageSize = 5;

  readonly taskManagementRoute = ROUTES.TEAM_LEAD.TASK_MANAGEMENT_ABSOLUTE;

  // Expose enums/labels to template
  readonly TaskStatuses = TaskStatuses;
  readonly ProjectStatus = ProjectStatus;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly statusLabels = TASK_STATUS_LABELS;
  readonly projectStatusLabels = PROJECT_STATUS_LABELS;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(page: number = this.currentPage): void {
    this.isLoading = true;
    this.dashboardService.getDashboard(page, this.pageSize).subscribe({
      next: (res) => {
        this.dashboard = res.data;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isLoading = false;
      },
    });
  }

  get totalPages(): number {
    if (!this.dashboard) return 0;
    return Math.ceil(this.dashboard.recentTeamTasksTotalCount / this.pageSize);
  }

  get visiblePages(): number[] {
    if (this.totalPages <= 2) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    if (this.currentPage === 1) {
      return [1, 2];
    }

    if (this.currentPage < this.totalPages) {
      return [this.currentPage, this.currentPage + 1];
    }

    return [this.totalPages - 1, this.totalPages];
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.loadDashboard(page);
  }

  getPriorityLabel(priority: TaskPriority): string {
    return this.priorityLabels[priority] ?? '—';
  }

  getStatusLabel(status: TaskStatuses): string {
    return this.statusLabels[status] ?? '—';
  }

  getProjectStatusLabel(status: ProjectStatus): string {
    return this.projectStatusLabels[status] ?? '—';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  getDaysOverdue(dateStr: string): number {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getProjectStatusBadge(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      [ProjectStatus.Active]: 'badge--active',
      [ProjectStatus.Completed]: 'badge--completed',
      [ProjectStatus.OnHold]: 'badge--hold',
      [ProjectStatus.Cancelled]: 'badge--cancelled',
    };
    return map[status] ?? '';
  }

  private getError(err: any): string {
    const b = err?.error;
    return b?.errorMessages?.length
      ? b.errorMessages.join(' ')
      : b?.message ?? 'Something went wrong.';
  }
}
