import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveReviewPanel, Button, ButtonInputConfig } from '@common';
import { PublicHoliday } from '../public-holiday/public-holiday';

@Component({
  selector: 'app-admin-leave',
  imports: [CommonModule, LeaveReviewPanel, PublicHoliday, Button],
  templateUrl: './admin-leave.html',
  styleUrl: './admin-leave.css',
})
export class AdminLeave {
  activeTab: 'leave-requests' | 'public-holidays' = 'leave-requests';

  get leaveRequestsTabConfig(): ButtonInputConfig {
    return {
      variant: 'close',
      text: 'Leave Requests',
      onClick: () => this.switchTab('leave-requests'),
    };
  }

  get publicHolidaysTabConfig(): ButtonInputConfig {
    return {
      variant: 'close',
      text: 'Public Holidays',
      onClick: () => this.switchTab('public-holidays'),
    };
  }

  switchTab(tab: 'leave-requests' | 'public-holidays'): void {
    this.activeTab = tab;
  }
}