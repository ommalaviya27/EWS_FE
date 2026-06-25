import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Password, PasswordInputConfig, Button, ButtonInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { AuthService } from '../../services/auth.service';
import { ROUTES } from '@constants';
import { ApiResponse } from '@models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Password, Button],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  resetForm!: FormGroup;
  newPasswordConfig!: PasswordInputConfig;
  confirmPasswordConfig!: PasswordInputConfig;
  submitButtonConfig!: ButtonInputConfig;
  isLoading = false;
  token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.toastr.error('Invalid or missing reset token.');
      this.router.navigate([ROUTES.AUTH.FORGOT_PASSWORD.FORGOT_PASSWORD_ABSOLUTE]);
      return;
    }

    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, AppValidators.password]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: AppValidators.matchPasswords('newPassword', 'confirmPassword') }
    );

    this.newPasswordConfig = { formControlName: 'newPassword', placeholder: 'Enter Password', floating: true };
    this.confirmPasswordConfig = { formControlName: 'confirmPassword', placeholder: 'Confirm Password', floating: true };

    this.submitButtonConfig = {
      type: 'submit',
      variant: 'save',
      cssClass: 'btn-save',
      text: 'Set New Password',
      isLoading: false,
      disabled: false,
    };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.toastr.warning('Please fill in all fields correctly.');
      return;
    }

    this.isLoading = true;
    this.submitButtonConfig = { ...this.submitButtonConfig, isLoading: true, disabled: true };

    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.resetForm.value.newPassword,
        confirmNewPassword: this.resetForm.value.confirmPassword,
      })
      .subscribe({
        next: (res: ApiResponse<null>) => {
          this.isLoading = false;
          this.submitButtonConfig = { ...this.submitButtonConfig, isLoading: false, disabled: false };
          if (res.isSuccess) {
            this.toastr.success('Password reset successfully! Please sign in with your new password.');
            this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
          } else {
            this.toastr.error(res.errorMessages?.[0] || res.message || 'Reset failed.');
          }
        },
        error: (err: { error?: ApiResponse<null> }) => {
          this.isLoading = false;
          this.submitButtonConfig = { ...this.submitButtonConfig, isLoading: false, disabled: false };
          this.toastr.error(
            err?.error?.errorMessages?.[0] || err?.error?.message || 'Something went wrong. The link may have expired.'
          );
        },
      });
  }

  goToLogin(): void {
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }
}
