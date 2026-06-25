import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Button, ButtonInputConfig } from '@common';
import { AttendanceService } from '@services';
import { AttendanceDayResponse, AttendanceMonthResponse, AttendanceStatus, ApprovalStatus, ATTENDANCE_STATUS_OPTIONS } from '@models';
import { MONTHS } from '@constants';

@Component({
  selector: 'app-attendance-calendar',
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './attendance-calendar.html',
  styleUrl: './attendance-calendar.css',
})
export class AttendanceCalendar implements OnInit, OnChanges {
  private svc = inject(AttendanceService);
  private toastr = inject(ToastrService);

  @Input() userId: number | null = null;
  @Input() canFill = true;
  @Input() readonly = false;
  @Input() canEditApproved = false;
  @Output() attendanceChanged = new EventEmitter<void>();

  readonly months = MONTHS;
  readonly statusOptions = ATTENDANCE_STATUS_OPTIONS;
  readonly ApprovalStatus = ApprovalStatus;
  readonly AttendanceStatus = AttendanceStatus;

  today = new Date();
  selectedMonth = this.today.getMonth() + 1;
  selectedYear = this.today.getFullYear();
  years: number[] = [];

  monthData: AttendanceMonthResponse | null = null;
  isLoading = false;

  openDropdownDay: number | null = null;
  dropdownTop = 0;
  dropdownLeft = 0;

  pendingStatus: AttendanceStatus | null = null;
  editingDay: AttendanceDayResponse | null = null;

  searchBtnConfig!: ButtonInputConfig;
  resetBtnConfig!: ButtonInputConfig;
  fillBtnConfig!: ButtonInputConfig;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) this.init();
  }

  ngOnInit(): void {
    this.init();
    this.initButtonConfigs();
  }

  private init(): void {
    if (!this.years.length) {
      const cur = new Date().getFullYear();
      for (let y = cur - 2; y <= cur; y++) this.years.push(y);
    }
    this.load();
  }

  private initButtonConfigs(): void {
    this.searchBtnConfig = {
      variant: 'save',
      text: 'Search',
      onClick: () => this.load(),
    };

    this.resetBtnConfig = {
      variant: 'close',
      text: 'Reset',
      onClick: () => this.reset(),
    };

    this.fillBtnConfig = {
      variant: 'save',
      text: 'Fill Attendance',
      onClick: () => this.fillAttendance(),
    };
  }

  load(): void {
    this.isLoading = true;
    this.openDropdownDay = null;
    this.pendingStatus = null;
    this.editingDay = null;
    this.svc.getMonthly(this.selectedMonth, this.selectedYear, this.userId ?? undefined).subscribe({
      next: (res) => {
        this.monthData = res.data;
        this.isLoading = false;
        const todayEntry = this.monthData?.days.find((d) => d.isToday);
        if (todayEntry?.status) {
          this.pendingStatus = todayEntry.status;
        }
      },
      error: (e) => {
        this.toastr.error(e?.error?.message);
        this.isLoading = false;
      },
    });
  }

  reset(): void {
    this.selectedMonth = this.today.getMonth() + 1;
    this.selectedYear = this.today.getFullYear();
    this.load();
  }

  get isTodayApproved(): boolean {
    if (this.canEditApproved) return false;
    if (!this.monthData || !this.isCurrentMonth()) return false;
    const todayEntry = this.monthData.days.find((d) => d.isToday);
    return todayEntry?.approvalStatus === ApprovalStatus.Approved;
  }

  openDropdown(event: MouseEvent, day: AttendanceDayResponse): void {
    if (this.readonly || !this.canFill || !day.canEdit) return;
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownTop = rect.bottom + window.scrollY + 4;
    this.dropdownLeft = rect.left + window.scrollX;
    this.openDropdownDay = day.day;
    this.editingDay = day;
    this.pendingStatus = day.status ?? null;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdownDay = null;
  }

  stageStatus(statusValue: AttendanceStatus): void {
    this.pendingStatus = statusValue;
    this.openDropdownDay = null;
  }

  fillAttendance(): void {
    if (!this.monthData) return;

    if (this.pendingStatus === null) {
      this.toastr.warning('Please select an attendance status before saving.');
      return;
    }

    const statusToSubmit = this.pendingStatus;
    const targetDay = this.editingDay || this.monthData.days.find((d) => d.isToday);

    if (!targetDay) {
      this.toastr.warning('Please select a valid day to submit attendance.');
      return;
    }

    const call$ = targetDay.attendanceId
      ? this.svc.edit(targetDay.attendanceId, statusToSubmit)
      : this.canEditApproved 
        ? this.svc.adminFill({
            userId: this.monthData.userId,
            status: statusToSubmit,
            attendanceDate: `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(targetDay.day).padStart(2, '0')}`,
          })
        : this.svc.add(statusToSubmit);

    call$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.editingDay = null;
        this.pendingStatus = null;
        this.load();
        this.attendanceChanged.emit();
      },
      error: (e) => this.toastr.error(e?.error?.message),
    });
  }

  isCurrentMonth(): boolean {
    return (
      this.selectedMonth === this.today.getMonth() + 1 &&
      this.selectedYear === this.today.getFullYear()
    );
  }

  getDayClass(day: AttendanceDayResponse): string {
    if (day.isWeekend) return 'day-muted';
    if (day.isAutoAbsent) return 'day-absent';
    if (day.isPublicHoliday) return 'day-holiday';

    const isCurrMonth = this.isCurrentMonth();

    if (day.isToday && isCurrMonth) {
      if (day.approvalStatus === ApprovalStatus.Approved) {
        if (!day.status) return 'day-today';
        if (day.status === AttendanceStatus.Absent) return 'day-absent';
        if (
          day.status === AttendanceStatus.HalfDay_WFO ||
          day.status === AttendanceStatus.HalfDay_WFH
        )
          return 'day-half';
        return 'day-present';
      }
      if (day.approvalStatus === ApprovalStatus.Rejected) return 'day-rejected';
      return 'day-today';
    }

    const cellDate = new Date(this.selectedYear, this.selectedMonth - 1, day.day);
    const todayDate = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate()
    );
    const isPast = cellDate < todayDate;

    if (this.canEditApproved && this.editingDay?.day === day.day && this.pendingStatus !== null) {
      return 'day-today';
    }

    if (!day.status) {
      return isPast ? 'day-muted' : 'day-empty';
    }

    if (day.approvalStatus === ApprovalStatus.Rejected) return 'day-rejected';
    if (day.status === AttendanceStatus.Absent) return 'day-absent';
    if (
      day.status === AttendanceStatus.HalfDay_WFO ||
      day.status === AttendanceStatus.HalfDay_WFH
    ) {
      return 'day-half';
    }

    return 'day-present';
  }

  getDayLabel(day: AttendanceDayResponse): string {
    if (day.isWeekend) return '';
    if (day.isAutoAbsent) return 'A';

    if (day.isToday && this.isCurrentMonth()) {
      if (day.approvalStatus === ApprovalStatus.Approved) {
        if (!day.status) return '';
        if (day.status === AttendanceStatus.Absent) return 'A';
        if (day.status === AttendanceStatus.HalfDay_WFO) return 'HO';
        if (day.status === AttendanceStatus.HalfDay_WFH) return 'HH';
        if (day.status === AttendanceStatus.Present_WFO) return 'PO';
        if (day.status === AttendanceStatus.Present_WFH) return 'PH';
      }
      if (day.approvalStatus === ApprovalStatus.Rejected) return 'R';
      if (this.pendingStatus && !this.canEditApproved) {
        if (this.pendingStatus === AttendanceStatus.Absent) return 'A';
        if (this.pendingStatus === AttendanceStatus.HalfDay_WFO) return 'HO';
        if (this.pendingStatus === AttendanceStatus.HalfDay_WFH) return 'HH';
        if (this.pendingStatus === AttendanceStatus.Present_WFO) return 'PO';
        if (this.pendingStatus === AttendanceStatus.Present_WFH) return 'PH';
      }
      return '';
    }

    if (this.canEditApproved && this.editingDay?.day === day.day && this.pendingStatus !== null) {
      if (this.pendingStatus === AttendanceStatus.Absent) return 'A';
      if (this.pendingStatus === AttendanceStatus.HalfDay_WFO) return 'HO';
      if (this.pendingStatus === AttendanceStatus.HalfDay_WFH) return 'HH';
      if (this.pendingStatus === AttendanceStatus.Present_WFO) return 'PO';
      if (this.pendingStatus === AttendanceStatus.Present_WFH) return 'PH';
    }

    if (!day.status) return '';
    if (day.approvalStatus === ApprovalStatus.Rejected) return 'R';
    if (day.status === AttendanceStatus.Absent) return 'A';
    if (day.status === AttendanceStatus.HalfDay_WFO) return 'HO';
    if (day.status === AttendanceStatus.HalfDay_WFH) return 'HH';
    if (day.status === AttendanceStatus.Present_WFO) return 'PO';
    if (day.status === AttendanceStatus.Present_WFH) return 'PH';
    return '';
  }

  get workingDays(): number {
    if (!this.monthData) return 0;
    const { year, month } = this.monthData;
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day).getDay();
      if (d !== 0 && d !== 6) count++;
    }
    return count;
  }
}