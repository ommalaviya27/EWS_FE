import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonInputConfig } from '@common';
import { HolidayResponse, CreateHolidayRequest, UpdateHolidayRequest } from '../../models/public-holiday.model';

@Component({
  selector: 'app-public-holiday-modal',
  imports: [CommonModule, ReactiveFormsModule, Button],
  templateUrl: './public-holiday-modal.html',
  styleUrl: './public-holiday-modal.css',
})
export class PublicHolidayModal implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isLoading = false;
  @Input() holiday: HolidayResponse | null = null;

  @Output() save = new EventEmitter<CreateHolidayRequest | UpdateHolidayRequest>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;

  get isEditMode(): boolean {
    return this.holiday !== null;
  }

  ngOnInit(): void {
    this.buildForm();
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
      name: [
        this.holiday?.name ?? '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      holidayDate: [
        this.holiday ? this.holiday.holidayDate.split('T')[0] : '',
        Validators.required,
      ],
    });
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.onCancel(),
    };
    this.submitBtnConfig = {
      variant: 'save',
      text: this.isEditMode ? 'Update Holiday' : 'Add Holiday',
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
      name: val.name.trim(),
      holidayDate: new Date(val.holidayDate).toISOString(),
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}