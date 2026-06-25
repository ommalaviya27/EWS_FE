import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionService, ProfileService } from '@services';
import { AppValidators } from '@Validators';
import { Password, PasswordInputConfig, Button, ButtonInputConfig } from '@common';
import { ROUTES } from '@constants';
import { ApiResponse } from '@models';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Password, Button],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css'],
})
export class ChangePassword implements OnInit, OnChanges {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  passwordForm!: FormGroup;
  isSaving = false;

  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;

  oldPasswordConfig: PasswordInputConfig = { formControlName: 'oldPassword', placeholder: 'Current Password', floating: true };
  newPasswordConfig: PasswordInputConfig = { formControlName: 'newPassword', placeholder: 'New Password', floating: true };
  confirmPasswordConfig: PasswordInputConfig = { formControlName: 'confirmNewPassword', placeholder: 'Confirm New Password', floating: true };

  ngOnInit(): void {
    this.buildForm();
    this.initButtonConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.buildForm();
    }
    this.initButtonConfigs();
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      type: 'button', variant: 'close', text: 'Cancel',
      onClick: () => this.onCancel()
    };
    this.submitBtnConfig = {
      type: 'submit', variant: 'save', text: 'Update Password',
      isLoading: this.isSaving, disabled: this.isSaving
    };
  }

  private buildForm(): void {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, AppValidators.password]],
        confirmNewPassword: ['', [Validators.required]],
      },
      { validators: AppValidators.matchPasswords('newPassword', 'confirmNewPassword') }
    );
  }

  onCancel(): void {
    this.closed.emit();
  }

  get passwordMismatch(): boolean {
    return !!(
      this.passwordForm.hasError('passwordMismatch') &&
      this.passwordForm.get('confirmNewPassword')?.touched
    );
  }

  onSubmit(): void {
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      const controls = this.passwordForm.controls;

      if (controls['oldPassword'].hasError('required')) {
        this.toastr.warning('Current password is required.');
        return;
      }
      if (controls['newPassword'].hasError('required')) {
        this.toastr.warning('New password is required.');
        return;
      }
      if (controls['newPassword'].hasError('invalidPassword')) {
        this.toastr.warning('New password must be 8–15 characters with a letter, number, and special character.');
        return;
      }
      if (controls['confirmNewPassword'].hasError('required')) {
        this.toastr.warning('Please confirm your new password.');
        return;
      }
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.toastr.warning('New password and confirm password do not match.');
        return;
      }
      return;
    }

    this.isSaving = true;
    this.initButtonConfigs();

    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (res: ApiResponse<null>) => {
        this.isSaving = false;
        this.initButtonConfigs();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Password changed successfully. Please sign in again.');
          this.sessionService.clearAll();
          this.closed.emit();
          setTimeout(() => this.router.navigate([ROUTES.AUTH.LOGIN.LOGIN_ABSOLUTE]), 300);
        } else {
          this.toastr.error(res.errorMessages?.[0] || res.message || 'Failed to change password.');
        }
      },
      error: (err: { error?: ApiResponse<null> }) => {
        this.isSaving = false;
        this.initButtonConfigs();
        this.toastr.error(
          err?.error?.errorMessages?.[0] || err?.error?.message || 'Something went wrong. Please try again.'
        );
      },
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate([ROUTES.AUTH.FORGOT_PASSWORD.FORGOT_PASSWORD_ABSOLUTE]);
  }
}