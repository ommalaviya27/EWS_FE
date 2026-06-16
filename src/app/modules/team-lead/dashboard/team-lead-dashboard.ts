import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TeamLeadDashboardService } from '../dashboard/services/team-lead-dashboard.service';
import { TeamLeadDashboard, TeamLeadDashboardTask, TaskPriority, TASK_PRIORITY_LABELS } from '../dashboard/models/team-lead-dashboard.model';

@Component({
  selector: 'app-team-lead-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-lead-dashboard.html',
  styleUrls: ['./team-lead-dashboard.css'],
})
export class TeamLeadDashboardComponent implements OnInit {
  private dashboardService = inject(TeamLeadDashboardService);
  private toastr = inject(ToastrService);

  dashboard: TeamLeadDashboard | null = null;
  isLoading = false;

  readonly priorityLabels = TASK_PRIORITY_LABELS;

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

  getDaysUntilDue(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private getError(err: any): string {
    const b = err?.error;
    return b?.errorMessages?.length
      ? b.errorMessages.join(' ')
      : b?.message ?? 'Something went wrong.';
  }
}