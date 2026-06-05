import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MyTaskService } from '../my-tasks/services/my-task.service';
import {
  EmployeeDashboard,
  MyTask,
  TaskPriority,
  TASK_PRIORITY_LABELS,
} from '../my-tasks/models/my-task.model';
import { TaskDetailModel } from '../my-tasks/components/task-detail-model/task-detail-model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskDetailModel],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css'],
})
export class EmployeeDashboardComponent implements OnInit {
  private myTaskService = inject(MyTaskService);
  private toastr = inject(ToastrService);

  dashboard: EmployeeDashboard | null = null;
  isLoading = false;
  selectedTask: MyTask | null = null;
  showDetailModal = false;

  readonly priorityLabels = TASK_PRIORITY_LABELS;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.myTaskService.getDashboard().subscribe({
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

  openTaskDetail(task: MyTask): void {
    this.selectedTask = task;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTask = null;
  }

  onTaskRefresh(): void {
    this.loadDashboard();
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

  private getError(err: any): string {
    const b = err?.error;
    return b?.errorMessages?.length
      ? b.errorMessages.join(' ')
      : b?.message ?? 'Something went wrong.';
  }
}
