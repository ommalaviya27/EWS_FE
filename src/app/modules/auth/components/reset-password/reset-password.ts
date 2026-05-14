import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Password, PasswordInputConfig } from '@common';
import { AppValidators } from '../../../../common/validators/app.validators';
import { AuthService } from '../../services/auth.service';
import { ROUTES } from '../../../../common/constants/route-paths';
import { ApiResponse } from '../../../../common/models/api-response.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Password],
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
  isLoading = false;
  resetSuccess = false;
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

    this.newPasswordConfig = { formControlName: 'newPassword', placeholder: 'Enter Password', floating:true };
    this.confirmPasswordConfig = { formControlName: 'confirmPassword', placeholder: 'Confirm Password', floating:true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.toastr.warning('Please fill in all fields correctly.');
      return;
    }

    this.isLoading = true;

    this.authService
      .resetPassword({ token: this.token, ...this.resetForm.value })
      .subscribe({
        next: (res: ApiResponse<null>) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.resetSuccess = true;
            this.toastr.success('Password reset successfully!');
          } else {
            this.toastr.error(res.errorMessages?.[0] || res.message || 'Reset failed.');
          }
        },
        error: (err: { error?: ApiResponse<null> }) => {
          this.isLoading = false;
          this.toastr.error(err?.error?.errorMessages?.[0] || err?.error?.message || 'Something went wrong. The link may have expired.');
        },
      });
  }

  goToLogin(): void {
    this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]);
  }
}
