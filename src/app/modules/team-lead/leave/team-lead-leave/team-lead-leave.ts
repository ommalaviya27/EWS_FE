import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveList, LeaveReviewPanel } from '@common';

@Component({
  selector: 'app-team-lead-leave',
  imports: [CommonModule, LeaveList, LeaveReviewPanel],
  templateUrl: './team-lead-leave.html',
  styleUrl: './team-lead-leave.css',
})
export class TeamLeadLeave {
  activeTab: 'my-leaves' | 'review' = 'my-leaves';

  switchTab(tab: 'my-leaves' | 'review'): void {
    this.activeTab = tab;
  }
}