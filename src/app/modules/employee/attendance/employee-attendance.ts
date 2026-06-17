import { Component } from '@angular/core';
import { AttendanceCalendar } from '@common';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [AttendanceCalendar],
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.css',
})
export class EmployeeAttendance {

}