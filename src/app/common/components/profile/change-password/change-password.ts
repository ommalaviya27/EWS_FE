import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { AppValidators } from '../../../validators/app.validators';
import { Password, PasswordInputConfig } from '@common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Password],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css'],
})
export class ChangePassword implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  passwordForm!: FormGroup;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  oldPasswordConfig: PasswordInputConfig = {
    formControlName: 'oldPassword',
    placeholder: 'Current Password',
    floating: true,
  };

  newPasswordConfig: PasswordInputConfig = {
    formControlName: 'newPassword',
    placeholder: 'New Password',
    floating: true,
  };

  confirmPasswordConfig: PasswordInputConfig = {
    formControlName: 'confirmNewPassword',
    placeholder: 'Confirm New Password',
    floating: true,
  };

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, AppValidators.password]],
        confirmNewPassword: ['', [Validators.required]],
      },
      { validators: AppValidators.matchPasswords('newPassword', 'confirmNewPassword') }
    );
  }

  get oldCtrl() {
    return this.passwordForm.get('oldPassword');
  }
  get newCtrl() {
    return this.passwordForm.get('newPassword');
  }
  get confirmCtrl() {
    return this.passwordForm.get('confirmNewPassword');
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.successMessage =
            res.message || 'Password changed successfully. Please log in again.';
          this.passwordForm.reset();
          setTimeout(() => this.router.navigate(['/auth/login']), 2500);
        } else {
          this.errorMessage = res.message || 'Failed to change password.';
        }
        this.isSaving = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'An error occurred. Please try again.';
        this.isSaving = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}