import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceCalendar } from '../../../common/components/attendance-calendar/attendance-calendar';
import { AttendanceReviewPanel } from '../../../common/components/attendance-review-panel/attendance-review-panel';
import { AttendanceService } from '../../../common/services/attendance.service';
import { TaskManagementService } from '../task-management/services/task-management.service';
import { TeamMember } from '../task-management/models/task-management.model';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, AttendanceCalendar, AttendanceReviewPanel],
  templateUrl: './team-lead-attendance.html',
  styleUrl: './team-lead-attendance.css',
})
export class TeamLeadAttendance implements OnInit {
  private svc = inject(AttendanceService);
  private taskSvc = inject(TaskManagementService);
  private toastr = inject(ToastrService);

  selectedUserId: number | null = null;
  activeTab: 'self' | 'team' | 'review' = 'self';

  teamMembers: TeamMember[] = [];
  teamMembersLoading = false;

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  private loadTeamMembers(): void {
    this.teamMembersLoading = true;
    this.taskSvc.getTeamMembers().subscribe({
      next: (res) => {
        this.teamMembers = res.data ?? [];
        this.teamMembersLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load team members.');
        this.teamMembersLoading = false;
      },
    });
  }

  switchTab(tab: 'self' | 'team' | 'review'): void {
    this.activeTab = tab;
    if (tab !== 'team') this.selectedUserId = null;
  }

  onMemberSelect(value: string): void {
    this.selectedUserId = value ? Number(value) : null;
  }
}