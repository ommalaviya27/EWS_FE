import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Email, Password, NameField, MobileNumber, EmailInputConfig, PasswordInputConfig, NameFieldConfig, MobileNumberConfig} from '@common';
import { AppValidators } from '../../../../common/validators/app.validators';
import { AuthService } from '../../services/auth.service';
import { ROUTES } from '../../../../common/constants/route-paths';
import { ROLE_NAMES } from '../../models/auth.model';
import { ApiResponse } from '../../../../common/models/api-response.model';
import { SignupResponse } from '../../models/auth.model';

interface RoleOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, Email, Password, NameField, MobileNumber ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  signupForm!: FormGroup;
  nameConfig!: NameFieldConfig;
  emailConfig!: EmailInputConfig;
  passwordConfig!: PasswordInputConfig;
  confirmPasswordConfig!: PasswordInputConfig;
  mobileConfig!: MobileNumberConfig;
  isLoading = false;
  showRoleDropdown = false;

  roles: RoleOption[] = Object.entries(ROLE_NAMES).map(([id, name]) => ({
    id: Number(id),
    name: name as string,
  }));

  ngOnInit(): void {
    this.initForm();
    this.initConfigs();
  }

  private initForm(): void {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, AppValidators.name]],
        email: ['', [Validators.required, AppValidators.email]],
        mobileNumber: ['', [Validators.required, AppValidators.phone]],
        roleId: [null, [Validators.required]],
        password: ['', [Validators.required, AppValidators.password]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: AppValidators.matchPasswords('password', 'confirmPassword') }
    );
  }

  private initConfigs(): void {
    this.nameConfig = { formControlName: 'name', placeholder: 'Enter your full name' };
    this.emailConfig = { formControlName: 'email', placeholder: 'Enter your email' };
    this.mobileConfig = { formControlName: 'mobileNumber', placeholder: 'Enter mobile number' };
    this.passwordConfig = { formControlName: 'password', placeholder: 'Create password' };
    this.confirmPasswordConfig = { formControlName: 'confirmPassword', placeholder: 'Confirm password' };
  }

  get selectedRoleName(): string {
    const roleId = this.signupForm.get('roleId')?.value;
    if (!roleId) return 'Select Role';
    return ROLE_NAMES[roleId] || 'Select Role';
  }

  get isRoleTouched(): boolean {
    return !!this.signupForm.get('roleId')?.touched;
  }

  get isRoleInvalid(): boolean {
    return !!this.signupForm.get('roleId')?.invalid;
  }

  selectRole(role: RoleOption): void {
    this.signupForm.patchValue({ roleId: role.id });
    this.signupForm.get('roleId')?.markAsTouched();
    this.showRoleDropdown = false;
  }

  toggleDropdown(): void {
    this.showRoleDropdown = !this.showRoleDropdown;
  }

  closeDropdown(): void {
    this.showRoleDropdown = false;
    this.signupForm.get('roleId')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    const { confirmPassword, ...payload } = this.signupForm.value;

    this.authService.signup(payload).subscribe({
      next: (res: ApiResponse<SignupResponse>) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.toastr.success('Account created successfully! Please sign in.');
          this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
        } else {
          this.toastr.error(res.errorMessages?.[0] || res.message || 'Signup failed.');
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || 'Something went wrong. Please try again.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }
}
