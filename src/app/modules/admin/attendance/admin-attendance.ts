import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceCalendar } from '../../../common/components/attendance-calendar/attendance-calendar';
import { AttendanceReviewPanel } from '../../../common/components/attendance-review-panel/attendance-review-panel';
import { ProjectService } from '../project/services/project.service';
import { TeamLeader } from '../project/models/project.model';

@Component({
  selector: 'app-admin-attendance',
  imports: [CommonModule, FormsModule, AttendanceCalendar, AttendanceReviewPanel],
  templateUrl: './admin-attendance.html',
  styleUrl: './admin-attendance.css',
})
export class AdminAttendance implements OnInit {
  private projectSvc = inject(ProjectService);
  private toastr = inject(ToastrService);

  activeTab: 'team-leads' | 'review' = 'review';

  teamLeads: TeamLeader[] = [];
  teamLeadsLoading = false;
  selectedUserId: number | null = null;

  ngOnInit(): void {
    this.loadTeamLeads();
  }

  private loadTeamLeads(): void {
    this.teamLeadsLoading = true;
    this.projectSvc.getTeamLeaders().subscribe({
      next: (res) => {
        this.teamLeads = res.data ?? [];
        this.teamLeadsLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load team leads.');
        this.teamLeadsLoading = false;
      },
    });
  }

  switchTab(tab: 'team-leads' | 'review'): void {
    this.activeTab = tab;
    if (tab !== 'team-leads') this.selectedUserId = null;
  }

  onTeamLeadSelect(value: string): void {
    this.selectedUserId = value ? Number(value) : null;
  }
}