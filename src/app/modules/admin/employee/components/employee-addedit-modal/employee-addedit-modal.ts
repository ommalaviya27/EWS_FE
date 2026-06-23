import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, Role, TeamLead, EmployeeRole, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../models/employee.model';
import { NameFieldConfig, Name, EmailInputConfig, Email, MobileNumberConfig, MobileNumber, PasswordInputConfig, Password, Button, ButtonInputConfig } from '@common';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-addedit-modal',
  imports: [CommonModule, ReactiveFormsModule, Name, Email, MobileNumber, Password, Button],
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
  private employeeService = inject(EmployeeService);

  nameConfig!: NameFieldConfig;
  emailConfig!: EmailInputConfig;
  mobileConfig!: MobileNumberConfig;
  passwordConfig!: PasswordInputConfig;

  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;

  employeeform!: FormGroup;
  roleList: Role[] = [];
  teamLeads: TeamLead[] = [];
  readonly EmployeeRole = EmployeeRole;

  get isEditMode(): boolean {
    return this.employee !== null;
  }

  get selectedRoleId(): number {
    return Number(this.employeeform?.get('roleId')?.value);
  }

  get showTeamLeadField(): boolean {
    return this.selectedRoleId === EmployeeRole.Employee;
  }

  ngOnInit(): void {
    this.buildForm();
    this.initConfigs();
    this.loadRoles();
    this.loadTeamLeads();
    this.initButtonConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.buildForm();
      this.loadRoles();
      this.loadTeamLeads();
    }

    this.initButtonConfigs();
  }

  private loadRoles(): void {
    this.employeeService.getRoles().subscribe({
      next: (res) => {
        this.roleList = (res.data ?? []).filter(r => r.roleId !== EmployeeRole.Admin);
      },
      error: () => {
        this.roleList = [];
      },
    });
  }

  private loadTeamLeads(): void {
    this.employeeService.getTeamLeads().subscribe({
      next: (res) => {
        this.teamLeads = res.data ?? [];
      },
      error: () => {
        this.teamLeads = [];
      },
    });
  }

  private initConfigs(): void {
    this.nameConfig = { formControlName: 'name', placeholder: 'Full Name', floating: true};
    this.emailConfig = { formControlName: 'email', placeholder: 'Email Address', floating: true };
    this.mobileConfig = { formControlName: 'mobileNumber', placeholder: 'Mobile Number', floating: true };
    this.passwordConfig = { formControlName: 'password', placeholder: 'Password', floating: true };
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      type: 'button',
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.onCancel()
    };

    this.submitBtnConfig = {
      type: 'submit',
      variant: 'save',
      text: this.isEditMode ? 'Update Employee' : 'Add Employee',
      isLoading: this.isLoading,
      disabled: this.isLoading
    };
  }

  private buildForm(): void {
    const e = this.employee;
    this.employeeform = this.fb.group({
      name: [
        e?.name ?? '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      email: [e?.email ?? '', [Validators.required, Validators.email]],
      mobileNumber: [e?.mobileNumber ?? '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      roleId: [e?.roleId ?? null, [Validators.required]],
      reportingId: [e?.reportingId ?? null],
      status: [e?.status ?? true, Validators.required],
    });

    this.updateReportingControlState();
  }

  onRoleChange(): void {
    if (this.selectedRoleId !== EmployeeRole.Employee) {
      this.employeeform.get('reportingId')?.setValue(null);
    }
    this.updateReportingControlState();
  }

  private updateReportingControlState(): void {
    const ctrl = this.employeeform?.get('reportingId');
    if (!ctrl) return;
    if (this.showTeamLeadField) {
      ctrl.enable();
    } else {
      ctrl.disable();
    }
  }

  onSubmit(): void {
    if (this.employeeform.invalid) {
      this.employeeform.markAllAsTouched();
      return;
    }
    const v = this.employeeform.getRawValue();
    const status = v.status === true || v.status === 'true';
    const reportingId = this.showTeamLeadField && v.reportingId ? Number(v.reportingId) : null;

    const payload = this.isEditMode
      ? ({
          name: v.name,
          email: v.email,
          mobileNumber: v.mobileNumber,
          roleId: Number(v.roleId),
          reportingId,
          status,
        } as UpdateEmployeeRequest)
      : ({
          name: v.name,
          email: v.email,
          password: v.password,
          mobileNumber: v.mobileNumber,
          roleId: Number(v.roleId),
          reportingId,
          status,
        } as CreateEmployeeRequest);
    this.save.emit(payload as any);
  }

  onCancel(): void {
    this.closed.emit();
  }

  isInvalid(field: string): boolean {
    const c = this.employeeform.get(field);
    return !!(c && c.invalid && c.touched);
  }

  getError(field: string): string {
    const c = this.employeeform.get(field);
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