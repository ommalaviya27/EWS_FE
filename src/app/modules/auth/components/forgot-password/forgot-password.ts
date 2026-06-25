import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Email, EmailInputConfig, Button, ButtonInputConfig} from '@common';
import { AppValidators } from '@Validators';
import { AuthService } from '../../services/auth.service';
import { ROUTES } from '@constants';
import { ApiResponse } from '@models';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, Email, Button],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  forgotForm!: FormGroup;
  emailConfig!: EmailInputConfig;
  submitBtnConfig!: ButtonInputConfig;
  resendBtnConfig!: ButtonInputConfig;
  isLoading = false;
  emailSent = false;

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.email]],
    });
    this.emailConfig = { formControlName: 'email', placeholder: 'Enter Email', floating:true };
    this.submitBtnConfig = { variant: 'save', type: 'submit', text: 'Send Reset Link', onClick: () => this.onSubmit() };
    this.resendBtnConfig = { variant: 'close', text: 'Back to Login', onClick: () => this.goToLogin() };
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.toastr.warning('Please enter a valid email address.');
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: (_res: ApiResponse<null>) => {
        this.isLoading = false;
        this.emailSent = true;
        this.toastr.success('Reset link sent! Check your email.');
      },
      error: (err: { error?: ApiResponse<null> }) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.errorMessages?.[0] || err?.error?.message || 'Something went wrong. Please try again.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }
}
