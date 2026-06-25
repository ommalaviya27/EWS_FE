import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Email, Password, Name, MobileNumber, EmailInputConfig, PasswordInputConfig, NameFieldConfig, MobileNumberConfig, Button, ButtonInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { AuthService } from '../../services/auth.service';
import { ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { SignupResponse } from '../../models/auth.model';

@Component({
  selector: 'app-signup',
  imports: [ CommonModule, ReactiveFormsModule, Email, Password, Name, MobileNumber, Button ],
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
  submitBtnConfig!: ButtonInputConfig;
  isLoading = false;

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
        password: ['', [Validators.required, AppValidators.password]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: AppValidators.matchPasswords('password', 'confirmPassword') }
    );
  }

  private initConfigs(): void {
    this.nameConfig = { formControlName: 'name', placeholder: 'Name', floating: true };
    this.emailConfig = { formControlName: 'email', placeholder: 'Email', floating: true };
    this.mobileConfig = { formControlName: 'mobileNumber', placeholder: 'Mobile Number', floating: true };
    this.passwordConfig = { formControlName: 'password', placeholder: 'Password', floating: true };
    this.confirmPasswordConfig = { formControlName: 'confirmPassword', placeholder: 'Confirm Password', floating: true };
    this.submitBtnConfig = { variant: 'save', type: 'submit', text: 'Create Account', onClick: () => this.onSubmit() };
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
          this.toastr.success(res.message || 'Account created successfully! Please sign in.');
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