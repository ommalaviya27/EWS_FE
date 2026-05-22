import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { AppValidators } from '../../../validators/app.validators';
import { Password, PasswordInputConfig, Button, ButtonInputConfig } from '@common';

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
  private router = inject(Router);

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

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.initButtonConfigs();

    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.passwordForm.reset();
          this.onCancel();
          setTimeout(() => this.router.navigate(['/auth/login']), 300);
        }
        this.isSaving = false;
        this.initButtonConfigs();
      },
      error: () => {
        this.isSaving = false;
        this.initButtonConfigs();
      },
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}