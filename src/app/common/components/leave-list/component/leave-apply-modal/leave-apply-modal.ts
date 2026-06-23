import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonInputConfig, Description, DescriptionFieldConfig, Name, NameFieldConfig, Email, EmailInputConfig, MobileNumber, MobileNumberConfig } from '@common';
import { LeaveResponse, ApplyLeaveRequest, EditLeaveRequest, LeaveType, LEAVE_TYPE_OPTIONS } from '../../../../models/leave.model';
import { ProfileService } from '../../../../services/profile.service';
import { GetProfileResponse } from '../../../../models/profile.model';

@Component({
  selector: 'app-leave-apply-modal',
  imports: [CommonModule, ReactiveFormsModule, Button, Description, Name, Email, MobileNumber],
  templateUrl: './leave-apply-modal.html',
  styleUrl: './leave-apply-modal.css',
})
export class LeaveApplyModal implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isLoading = false;
  @Input() leave: LeaveResponse | null = null;

  @Output() save = new EventEmitter<ApplyLeaveRequest | EditLeaveRequest>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileSvc = inject(ProfileService);

  leaveForm!: FormGroup;
  readonly LeaveType = LeaveType;
  readonly leaveTypeOptions = LEAVE_TYPE_OPTIONS;

  profile: GetProfileResponse | null = null;
  profileLoading = false;

  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;
  descriptionField!: DescriptionFieldConfig;
  userNameConfig!: NameFieldConfig;
  reportingPersonNameConfig!: NameFieldConfig;
  userEmailConfig!: EmailInputConfig;
  userMobileConfig!: MobileNumberConfig;

  get isEditMode(): boolean {
    return this.leave !== null;
  }

  today: string = new Date().toISOString().split('T')[0];

  get minEndDate(): string {
    return this.leaveForm?.get('startDate')?.value || this.today;
  }

  private countWorkingDays(from: Date, to: Date): number {
    let count = 0;
    const cur = new Date(from);
    while (cur <= to) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  private nextWorkingDay(from: Date): Date {
    const d = new Date(from);
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
  }

  get totalDays(): number {
    const f = this.leaveForm?.value;
    if (!f?.startDate || !f?.endDate || !f?.leaveType) return 0;
    
    const start = new Date(f.startDate);
    const end = new Date(f.endDate);
    if (end < start) return 0;

    const workingDays = this.countWorkingDays(start, end);
    const isHalfDay = +f.leaveType === LeaveType.HalfDay;

    return isHalfDay ? workingDays * 0.5 : workingDays;
  }

  get returnDate(): string {
    const f = this.leaveForm?.value;
    if (!f?.endDate || this.totalDays === 0) return '—';
    const end = new Date(f.endDate);
    const isHalfDay = +f.leaveType === LeaveType.HalfDay;
    const day = isHalfDay ? end : this.nextWorkingDay(end);
    return day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  ngOnInit(): void {
    this.buildForm();
    this.initConfigs();
    this.initButtonConfigs();
  }

  private initConfigs(): void {
    this.descriptionField = { formControlName: 'reason', placeholder: 'Reason for Leave' };
    this.userNameConfig = { formControlName: 'name', placeholder: 'Name', floating: true };
    this.reportingPersonNameConfig = { formControlName: 'reportingPersonName', placeholder: 'Reporting Person', floating: true };
    this.userEmailConfig = { formControlName: 'email', placeholder: 'Email', floating: true };
    this.userMobileConfig = { formControlName: 'mobileNumber', placeholder: 'Mobile Number', floating: true };
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = { variant: 'close', text: 'Cancel', onClick: () => this.onCancel() };
    this.submitBtnConfig = {
      variant: 'save',
      text: this.isEditMode ? 'Update Leave' : 'Apply Leave',
      type: 'submit',
      isLoading: this.isLoading,
      disabled: this.isLoading,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.buildForm();
      this.loadProfile();
    }
    this.initButtonConfigs();
  }

  private buildForm(): void {
    this.leaveForm = this.fb.group({
      name: [{ value: this.profile?.name ?? '', disabled: true }],
      reportingPersonName: [{ value: this.profile?.reportingPersonName ?? '', disabled: true }],
      email: [{ value: this.profile?.email ?? '', disabled: true }],
      mobileNumber: [{ value: this.profile?.mobileNumber ?? '', disabled: true }],
      leaveType: [this.leave?.leaveType ?? null, Validators.required],
      startDate: [this.leave ? this.leave.startDate.split('T')[0] : '', Validators.required],
      endDate: [this.leave ? this.leave.endDate.split('T')[0] : '', Validators.required],
      reason: [
        this.leave?.reason ?? '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
      ],
    });

    this.leaveForm.get('startDate')?.valueChanges.subscribe((val) => {
      const end = this.leaveForm.get('endDate')?.value;
      if (end && end < val) this.leaveForm.get('endDate')?.setValue(val);
    });
  }

  private loadProfile(): void {
    this.profileLoading = true;
    this.profileSvc.getProfile().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.profile = res.data;
          this.leaveForm.patchValue({
            name: res.data.name,
            email: res.data.email,
            mobileNumber: res.data.mobileNumber,
            reportingPersonName: res.data.reportingPersonName
          });
        }
        this.profileLoading = false;
      },
      error: () => {
        this.profileLoading = false;
      },
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.leaveForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }
    const val = this.leaveForm.value;
    this.save.emit({
      leaveType: +val.leaveType,
      startDate: new Date(val.startDate).toISOString(),
      endDate: new Date(val.endDate).toISOString(),
      reason: val.reason.trim(),
    } as ApplyLeaveRequest);
  }

  onCancel(): void {
    this.closed.emit();
  }
}