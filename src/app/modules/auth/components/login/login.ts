import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Email, Password, EmailInputConfig, PasswordInputConfig, Button, ButtonInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '@services';
import { ROUTES } from '@constants';
import { ApiResponse } from '@models';
import { LoginResponse } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Email, Password, Button],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);

  loginForm!: FormGroup;
  emailConfig!: EmailInputConfig;
  passwordConfig!: PasswordInputConfig;
  submitBtnConfig!: ButtonInputConfig;
  isLoading = false;

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectByRole(this.sessionService.roleId!);
      return;
    }
    this.initForm();
    this.initConfigs();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.email]],
      password: ['', [Validators.required, AppValidators.password]],
    });
  }

  private initConfigs(): void {
    this.emailConfig = { formControlName: 'email', placeholder: 'Email', floating:true };
    this.passwordConfig = { formControlName: 'password', placeholder: 'Password', floating:true };
    this.submitBtnConfig = { variant: 'save', type: 'submit', text: 'Sign In', onClick: () => this.onSubmit() };
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: ApiResponse<LoginResponse>) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.sessionService.setSession(res.data);
          this.toastr.success(`Welcome back, ${res.data.name}!`);
          this.authService.redirectByRole(res.data.roleId);
        } else {
          this.toastr.error(res.errorMessages?.[0] || res.message || 'Login failed.');
        }
      },
      error: (err: { error?: ApiResponse<null> }) => {
        this.isLoading = false;
        this.toastr.error(
          err?.error?.errorMessages?.[0] || err?.error?.message || 'Something went wrong.'
        );
      },
    });
  }

  goToForgotPassword(): void {
    this.router.navigate([ROUTES.AUTH.FORGOT_PASSWORD.FORGOT_PASSWORD_ABSOLUTE]);
  }

  goToSignup(): void {
    this.router.navigate([ROUTES.AUTH.SIGNUP.SIGNUP_ABSOLUTE]);
  }
}