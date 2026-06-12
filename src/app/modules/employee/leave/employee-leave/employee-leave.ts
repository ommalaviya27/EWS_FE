import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveList } from '@common';

@Component({
  selector: 'app-employee-leave',
  imports: [CommonModule, LeaveList],
  templateUrl: './employee-leave.html',
  styleUrl: './employee-leave.css',
})
export class EmployeeLeave {}
