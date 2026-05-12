import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Email, EmailInputConfig} from '@common';
import { AppValidators } from '../../../../common/validators/app.validators';
import { AuthService } from '../../services/auth.service';
import { ROUTES } from '../../../../common/constants/route-paths';
import { ApiResponse } from '../../../../common/models/api-response.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Email],
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
  isLoading = false;
  emailSent = false;

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, AppValidators.email]],
    });
    this.emailConfig = { formControlName: 'email', placeholder: 'Enter your registered email' };
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
