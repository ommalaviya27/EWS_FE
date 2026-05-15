import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Employee,
  EMPLOYEE_ROLE_LIST,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '../../models/employee.model';
import {
  NameFieldConfig,
  Name,
  EmailInputConfig,
  Email,
  MobileNumberConfig,
  MobileNumber,
  PasswordInputConfig,
  Password,
} from '@common';

@Component({
  selector: 'app-employee-addedit-modal',
  imports: [CommonModule, ReactiveFormsModule, Name, Email, MobileNumber, Password],
  templateUrl: './employee-addedit-modal.html',
  styleUrl: './employee-addedit-modal.css',
})
export class EmployeeAddeditModal implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isLoading = false;
  @Input() employee: Employee | null = null;
  @Output() save = new EventEmitter<CreateEmployeeRequest | UpdateEmployeeRequest>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  nameConfig!: NameFieldConfig;
  emailConfig!: EmailInputConfig;
  mobileConfig!: MobileNumberConfig;
  passwordConfig!: PasswordInputConfig;

  form!: FormGroup;
  roleList = EMPLOYEE_ROLE_LIST;

  get isEditMode(): boolean {
    return this.employee !== null;
  }

  ngOnInit(): void {
    this.buildForm();
    this.initConfigs();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) this.buildForm();
  }

  private initConfigs(): void {
    this.nameConfig = { formControlName: 'name', placeholder: 'Enter employee name' };
    this.emailConfig = { formControlName: 'email', placeholder: 'Enter email address' };
    this.mobileConfig = { formControlName: 'mobileNumber', placeholder: 'Enter mobile number' };
    this.passwordConfig = { formControlName: 'password', placeholder: 'Enter password' };
  }

  private buildForm(): void {
    const e = this.employee;
    this.form = this.fb.group({
      name: [
        e?.name ?? '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      email: [e?.email ?? '', [Validators.required, Validators.email]],
      mobileNumber: [e?.mobileNumber ?? '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      roleId: [e?.roleId ?? null, [Validators.required]],
      status: [e?.status ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const status = v.status === true || v.status === 'true';
    const payload = this.isEditMode
      ? ({
          name: v.name,
          email: v.email,
          mobileNumber: v.mobileNumber,
          roleId: Number(v.roleId),
          status,
        } as UpdateEmployeeRequest)
      : ({
          name: v.name,
          email: v.email,
          password: v.password,
          mobileNumber: v.mobileNumber,
          roleId: Number(v.roleId),
          status,
        } as CreateEmployeeRequest);
    this.save.emit(payload as any);
  }

  onCancel(): void {
    this.closed.emit();
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
  getError(field: string): string {
    const c = this.form.get(field);
    if (!c || !c.errors || !c.touched) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['minlength'])
      return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    if (c.errors['maxlength'])
      return `Maximum ${c.errors['maxlength'].requiredLength} characters allowed.`;
    if (c.errors['email']) return 'Please enter a valid email address.';
    if (c.errors['pattern']) return 'Please enter a valid 10-digit mobile number.';
    return 'Invalid value.';
  }
}
