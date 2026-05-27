import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminDashboard, TaskPriority, TaskStatuses, ProjectStatus, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, PROJECT_STATUS_LABELS } from './models/admin-dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(AdminDashboardService);
  private toastr = inject(ToastrService);

  dashboard: AdminDashboard | null = null;
  isLoading = false;

  readonly TaskStatuses = TaskStatuses;
  readonly ProjectStatus = ProjectStatus;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly statusLabels = TASK_STATUS_LABELS;
  readonly projectStatusLabels = PROJECT_STATUS_LABELS;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.dashboard = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getError(err));
        this.isLoading = false;
      },
    });
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

  getProjectStatusBadge(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      [ProjectStatus.Active]: 'badge--active',
      [ProjectStatus.Completed]: 'badge--completed',
      [ProjectStatus.OnHold]: 'badge--hold',
      [ProjectStatus.Cancelled]: 'badge--cancelled',
    };
    return map[status] ?? '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getDaysOverdue(dateStr: string): number {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getError(err: any): string {
    const b = err?.error;
    return b?.errorMessages?.length
      ? b.errorMessages.join(' ')
      : b?.message ?? 'Something went wrong.';
  }
}