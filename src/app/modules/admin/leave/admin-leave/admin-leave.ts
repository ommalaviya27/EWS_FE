import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveReviewPanel } from '@common';

@Component({
  selector: 'app-admin-leave',
  imports: [CommonModule, LeaveReviewPanel],
  templateUrl: './admin-leave.html',
  styleUrl: './admin-leave.css',
})
export class AdminLeave {}
