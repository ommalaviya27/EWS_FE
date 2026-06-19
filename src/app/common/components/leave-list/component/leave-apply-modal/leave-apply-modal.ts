import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonInputConfig, Description, DescriptionFieldConfig } from '@common';
import { LeaveResponse, LEAVE_TYPE_OPTIONS, ApplyLeaveRequest, EditLeaveRequest } from '../../../../models/leave.model';

@Component({
  selector: 'app-leave-apply-modal',
  imports: [CommonModule, ReactiveFormsModule, Button, Description],
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

  form!: FormGroup;
  readonly leaveTypeOptions = LEAVE_TYPE_OPTIONS;

  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;
  descriptionField!: DescriptionFieldConfig;

  get isEditMode(): boolean {
    return this.leave !== null;
  }

  today: string = new Date().toISOString().split('T')[0];

  get minEndDate(): string {
    const startDate = this.form.get('startDate')?.value;
    return startDate ? startDate : this.today;
  }

  ngOnInit(): void {
    this.buildForm();
    this.initConfigs();
    this.initButtonConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.buildForm();
    }
    this.initButtonConfigs();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      leaveType: [this.leave ? this.leave.leaveType : null, Validators.required],
      startDate: [this.leave ? this.leave.startDate.split('T')[0] : '', Validators.required],
      endDate: [this.leave ? this.leave.endDate.split('T')[0] : '', Validators.required],
      reason: [
        this.leave?.reason ?? '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
      ],
    });
  }

  private initConfigs(): void {
    this.descriptionField = {
      formControlName: 'reason',
      placeholder: 'Reason',
    };
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.onCancel(),
    };
    this.submitBtnConfig = {
      variant: 'save',
      text: this.isEditMode ? 'Update Leave' : 'Apply Leave',
      type: 'submit',
      isLoading: this.isLoading,
      disabled: this.isLoading,
    };
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    this.save.emit({
      leaveType: +val.leaveType,
      startDate: new Date(val.startDate).toISOString(),
      endDate: new Date(val.endDate).toISOString(),
      reason: val.reason.trim(),
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}