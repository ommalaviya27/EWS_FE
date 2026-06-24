import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceDayResponse, MemberRow, AttendanceStatus, ApprovalStatus, ATTENDANCE_STATUS_OPTIONS, AdminAddAttendanceRequest } from '../../models/attendance.model';
import { MONTHS } from '../../constants/app.constants';
import { TeamMember } from '../../../modules/team-lead/task-management/models/task-management.model';
import { Button, ButtonInputConfig } from '@common';

@Component({
  selector: 'app-team-attendance-grid',
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './team-attendance-grid.html',
  styleUrl: './team-attendance-grid.css',
})
export class TeamAttendanceGrid implements OnInit, OnChanges {
  private svc = inject(AttendanceService);
  private toastr = inject(ToastrService);

  @Input() teamMembers: TeamMember[] = [];
  @Input() groupLabel = '';

  readonly months = MONTHS;
  readonly statusOptions = ATTENDANCE_STATUS_OPTIONS;

  today = new Date();
  selectedMonth = this.today.getMonth() + 1;
  selectedYear = this.today.getFullYear();
  years: number[] = [];

  isLoading = false;
  approving = false;
  monthLabel = '';

  searchBtnConfig!: ButtonInputConfig;
  resetBtnConfig!: ButtonInputConfig;
  approveBtnConfig!: ButtonInputConfig;

  calendarDays: AttendanceDayResponse[] = [];
  memberRows: MemberRow[] = [];

  openDropdownInfo: { row: MemberRow; day: AttendanceDayResponse } | null = null;
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownOpenUpward = false;

  ngOnInit(): void {
    const cur = this.today.getFullYear();
    for (let y = cur - 2; y <= cur; y++) this.years.push(y);
    this.load();
    this.initButtonConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamMembers'] && !changes['teamMembers'].firstChange) {
      this.load();
    }
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
    this.approveBtnConfig = {
      variant: 'save',
      text: 'Approve All',
      onClick: () => this.approveAll(),
    };
  }

  load(): void {
    if (!this.teamMembers.length) return;
    this.isLoading = true;
    this.openDropdownInfo = null;

    this.buildCalendarDays();

    const userIds = this.teamMembers.map((m) => m.userId);

    this.svc.getTeamMonthly(this.selectedMonth, this.selectedYear, userIds).subscribe({
      next: (res) => {
        this.memberRows = [];

        if (this.groupLabel) {
          this.memberRows.push({
            userId: -1,
            userName: '',
            isGroupHeader: true,
            groupLabel: this.groupLabel,
            dayMap: {},
            month: this.selectedMonth,
            year: this.selectedYear,
            monthLabel: '',
            totalDays: 0,
            presentCount: 0,
            absentCount: 0,
            days: [],
          });
        }

        const membersByUserId = new Map((res.data?.members ?? []).map((m) => [m.userId, m]));
        if (res.data?.monthLabel) this.monthLabel = res.data.monthLabel;

        this.teamMembers.forEach((member) => {
          const monthData = membersByUserId.get(member.userId) ?? null;
          const dayMap: Record<number, AttendanceDayResponse> = {};
          if (monthData) {
            monthData.days.forEach((d) => (dayMap[d.day] = d));
          }
          this.memberRows.push({
            ...(monthData ?? {
              userId: member.userId,
              userName: member.name,
              month: this.selectedMonth,
              year: this.selectedYear,
              monthLabel: '',
              totalDays: 0,
              presentCount: 0,
              absentCount: 0,
              days: [],
            }),
            isGroupHeader: false,
            dayMap,
          });
        });

        this.isLoading = false;
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

  private buildCalendarDays(): void {
    this.calendarDays = [];
    this.monthLabel = '';
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, d);
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isToday =
        d === this.today.getDate() &&
        this.selectedMonth === this.today.getMonth() + 1 &&
        this.selectedYear === this.today.getFullYear();

      this.calendarDays.push({
        day: d,
        dayName: dayNames[dow],
        isWeekend,
        isToday,
        canEdit: false,
        isPublicHoliday: false,
        attendanceId: null,
        status: null,
        statusDisplay: null,
        approvalStatus: null,
        approvalStatusDisplay: null,
        isAutoAbsent: false,
      });
    }
  }

  isCellEditable(row: MemberRow, day: AttendanceDayResponse): boolean {
    if (row.isGroupHeader) return false;
    return !!row.dayMap[day.day]?.canEdit;
  }

  getCellClass(row: MemberRow, calDay: AttendanceDayResponse): string {
    if (calDay.isWeekend) return 'tag-td--weekend';

    if (calDay.isToday) {
      const d = row.dayMap[calDay.day];
      if (!d) return 'tag-td--today';
      if (d.approvalStatus === ApprovalStatus.Approved) {
        return this.statusClass(d.status);
      }
      return 'tag-td--today';
    }

    const d = row.dayMap[calDay.day];
    if (!d) return 'tag-td--empty';
    if (d.isPublicHoliday) return 'tag-td--holiday';
    if (d.isAutoAbsent) return 'tag-td--absent';
    if (!d.status) return 'tag-td--empty';
    return this.statusClass(d.status);
  }

  private statusClass(status: AttendanceStatus | null): string {
    if (!status) return 'tag-td--empty';
    if (status === AttendanceStatus.Absent) return 'tag-td--absent';
    if (status === AttendanceStatus.HalfDay_WFO || status === AttendanceStatus.HalfDay_WFH)
      return 'tag-td--half';
    return 'tag-td--present';
  }

  getCellLabel(row: MemberRow, calDay: AttendanceDayResponse): string {
    if (calDay.isWeekend) return '';
    const d = row.dayMap[calDay.day];
    if (!d) return '';
    if (d.isAutoAbsent) return 'A';
    if (!d.status) return '';
    if (d.status === AttendanceStatus.Absent) return 'A';
    if (d.status === AttendanceStatus.HalfDay_WFO || d.status === AttendanceStatus.HalfDay_WFH)
      return 'H';
    return 'P';
  }

  getActiveDayStatus(row: MemberRow, day: AttendanceDayResponse): AttendanceStatus | null {
    return row.dayMap[day.day]?.status ?? null;
  }

  openDropdown(event: MouseEvent, row: MemberRow, day: AttendanceDayResponse): void {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const dropdownHeight = 210;
    const spaceBelow = window.innerHeight - rect.bottom;
    this.dropdownOpenUpward = spaceBelow < dropdownHeight;
    if (this.dropdownOpenUpward) {
      this.dropdownTop = rect.top + window.scrollY - dropdownHeight - 4;
    } else {
      this.dropdownTop = rect.bottom + window.scrollY + 4;
    }
    this.dropdownLeft = rect.left + window.scrollX;
    this.openDropdownInfo = { row, day };
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdownInfo = null;
  }

  selectStatus(status: AttendanceStatus): void {
    if (!this.openDropdownInfo) return;
    const { row, day } = this.openDropdownInfo;
    this.openDropdownInfo = null;

    const existingDay = row.dayMap[day.day];
    const dateStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(
      day.day
    ).padStart(2, '0')}`;

    const call$ = existingDay?.attendanceId
      ? this.svc.edit(existingDay.attendanceId, status)
      : this.svc.adminFill({
          userId: row.userId,
          status,
          attendanceDate: dateStr,
        } as AdminAddAttendanceRequest);

    call$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        const prev = row.dayMap[day.day];
        const updated = res.data;

        const updatedDayEntry: AttendanceDayResponse = {
          day: day.day,
          dayName: day.dayName,
          isWeekend: false,
          isToday: day.isToday,
          isAutoAbsent: prev?.isAutoAbsent ?? false,
          isPublicHoliday: prev?.isPublicHoliday ?? false,
          holidayName: prev?.holidayName,
          canEdit: prev?.canEdit ?? true,
          attendanceId: updated?.id ?? prev?.attendanceId ?? null,
          status: updated?.status ?? status,
          statusDisplay: updated?.statusDisplay ?? null,
          approvalStatus: updated?.approvalStatus ?? prev?.approvalStatus ?? ApprovalStatus.Pending,
          approvalStatusDisplay:
            updated?.approvalStatusDisplay ?? prev?.approvalStatusDisplay ?? null,
        };

        const rowIndex = this.memberRows.indexOf(row);
        if (rowIndex !== -1) {
          this.memberRows[rowIndex] = {
            ...row,
            dayMap: {
              ...row.dayMap,
              [day.day]: updatedDayEntry,
            },
          };
          this.memberRows = [...this.memberRows];
        }
      },
      error: (e) => this.toastr.error(e?.error?.message),
    });
  }

  approveAll(): void {
    this.approving = true;
    this.svc.approveAllPending().subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.approving = false;
        this.load();
      },
      error: (e) => {
        this.toastr.error(e?.error?.message);
        this.approving = false;
      },
    });
  }
}