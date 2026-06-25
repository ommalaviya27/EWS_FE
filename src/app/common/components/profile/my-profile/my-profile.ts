import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionService,ProfileService } from '@services';
import { GetProfileResponse } from '@models';
import { AppValidators } from '@Validators';
import { ROLE_NAMES } from '../../../../modules/auth/models/auth.model';
import { APP_CONSTANTS } from '@constants';
import { Name, NameFieldConfig, Email, EmailInputConfig, MobileNumber, MobileNumberConfig, Button, ButtonInputConfig } from '@common';
import { ChangePassword } from '../change-password/change-password';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Name, Email, MobileNumber, Button, ChangePassword],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.css'],
})
export class MyProfile implements OnInit, OnChanges {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  sessionService = inject(SessionService);

  profileForm!: FormGroup;
  profile: GetProfileResponse | null = null;
  isLoading = true;
  isSaving = false;
  initials = '';
  isChangePasswordOpen = false;

  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;

  nameConfig: NameFieldConfig = { formControlName: 'name', placeholder: 'Full Name', floating: true };
  emailConfig: EmailInputConfig = { formControlName: 'email', placeholder: 'Email Address', floating: true };
  mobileConfig: MobileNumberConfig = { formControlName: 'mobileNumber', placeholder: 'Mobile Number', floating: true };

  ngOnInit(): void {
    this.initForm();
    this.initButtonConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.loadProfile();
    }
    this.initButtonConfigs();
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      type: 'button', variant: 'close', text: 'Cancel',
      onClick: () => this.onCancel()
    };
    this.submitBtnConfig = {
      type: 'submit', variant: 'save', text: 'Save Changes',
      isLoading: this.isSaving, disabled: this.isSaving
    };
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, AppValidators.name]],
      email: ['', [Validators.required, AppValidators.email]],
      mobileNumber: ['', [Validators.required, AppValidators.phone]],
    });
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.profile = res.data;
          this.updateInitials(res.data.name);
          this.profileForm.patchValue({
            name: res.data.name,
            email: res.data.email,
            mobileNumber: res.data.mobileNumber,
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load profile.');
        this.isLoading = false;
      },
    });
  }

  private updateInitials(name: string): void {
    this.initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

  get roleName(): string {
    if (this.profile) return this.profile.roleName;
    const roleId = this.sessionService.roleId;
    return roleId !== null ? ROLE_NAMES[roleId] ?? '' : '';
  }

  onCancel(): void {
    this.closed.emit();
  }

  openChangePassword(): void {
    this.isChangePasswordOpen = true;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.initButtonConfigs();

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.profile = res.data;
          this.updateInitials(res.data.name);
          const userRaw = localStorage.getItem(APP_CONSTANTS.USER_KEY);
          if (userRaw) {
            try {
              const stored = JSON.parse(userRaw);
              stored.name = res.data.name;
              stored.email = res.data.email;
              localStorage.setItem(APP_CONSTANTS.USER_KEY, JSON.stringify(stored));
            } catch { }
          }
          this.toastr.success(res.message);
          this.closed.emit();
        } else {
          this.toastr.error(res.message);
        }
        this.isSaving = false;
        this.initButtonConfigs();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'An error occurred. Please try again.');
        this.isSaving = false;
        this.initButtonConfigs();
      },
    });
  }
}