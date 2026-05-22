import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { SessionService } from '../../../services/session.service';
import { GetProfileResponse } from '../../../models/profile.model';
import { AppValidators } from '../../../validators/app.validators';
import { ROLE_NAMES, UserRole } from '../../../../modules/auth/models/auth.model';
import { ROUTES } from '../../../constants/route-paths';
import { APP_CONSTANTS } from '../../../constants/app.constants';
import { Name, NameFieldConfig, Email, EmailInputConfig, MobileNumber, MobileNumberConfig } from '@common';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Name, Email, MobileNumber],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.css'],
})
export class MyProfile implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  profileForm!: FormGroup;
  profile: GetProfileResponse | null = null;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  initials = '';

  nameConfig: NameFieldConfig = {
    formControlName: 'name',
    placeholder: 'Full Name',
    floating: true,
  };

  emailConfig: EmailInputConfig = {
    formControlName: 'email',
    placeholder: 'Email Address',
    floating: true,
  };

  mobileConfig: MobileNumberConfig = {
    formControlName: 'mobileNumber',
    placeholder: 'Mobile Number',
    floating: true,
  };

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
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
        this.errorMessage = 'Failed to load profile.';
        this.isLoading = false;
      },
    });
  }

  private updateInitials(name: string): void {
    this.initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  get roleName(): string {
    if (this.profile) return this.profile.roleName;
    const roleId = this.sessionService.roleId;
    return roleId !== null ? ROLE_NAMES[roleId] ?? '' : '';
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

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
            } catch {
              /* ignore */
            }
          }

          this.successMessage = res.message || 'Profile updated successfully.';
        } else {
          this.errorMessage = res.message || 'Failed to update profile.';
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
    const roleId = this.sessionService.roleId;
    if (roleId === UserRole.Admin) {
      this.router.navigate([ROUTES.ADMIN.DASHBOARD_ABSOLUTE]);
    } else if (roleId === UserRole.TeamLead) {
      this.router.navigate([ROUTES.TEAM_LEAD.DASHBOARD_ABSOLUTE]);
    } else {
      this.router.navigate([ROUTES.EMPLOYEE.DASHBOARD_ABSOLUTE]);
    }
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/profile/change-password']);
  }
}