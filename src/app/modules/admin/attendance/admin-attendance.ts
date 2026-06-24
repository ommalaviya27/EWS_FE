import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TeamAttendanceGrid } from '../../../common/components/team-attendance-grid/team-attendance-grid';
import { ProjectService } from '../project/services/project.service';
import { TeamLeader } from '../project/models/project.model';
import { TeamMember } from '../../team-lead/task-management/models/task-management.model';

@Component({
  selector: 'app-admin-attendance',
  imports: [CommonModule, FormsModule, TeamAttendanceGrid],
  templateUrl: './admin-attendance.html',
  styleUrl: './admin-attendance.css',
})
export class AdminAttendance implements OnInit {
  private projectSvc = inject(ProjectService);
  private toastr = inject(ToastrService);

  teamLeads: TeamLeader[] = [];
  teamLeadsLoading = false;
  teamLeadsAsMembers: TeamMember[] = [];

  ngOnInit(): void {
    this.loadTeamLeads();
  }

  private loadTeamLeads(): void {
    this.teamLeadsLoading = true;
    this.projectSvc.getTeamLeaders().subscribe({
      next: (res) => {
        this.teamLeads = res.data ?? [];
        this.teamLeadsAsMembers = this.teamLeads.map((tl) => ({ userId: tl.userId, name: tl.name }));
        this.teamLeadsLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load team leads.');
        this.teamLeadsLoading = false;
      },
    });
  }
}