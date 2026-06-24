import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaskManagementService } from '../task-management/services/task-management.service';
import { TeamMember } from '../task-management/models/task-management.model';
import { AttendanceCalendar, TeamAttendanceGrid } from "@common";

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, TeamAttendanceGrid, AttendanceCalendar],
  templateUrl: './team-lead-attendance.html',
  styleUrl: './team-lead-attendance.css',
})
export class TeamLeadAttendance implements OnInit {
  private taskSvc = inject(TaskManagementService);
  private toastr = inject(ToastrService);

  teamMembers: TeamMember[] = [];
  teamMembersLoading = false;
  currentUserName = '';

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
}