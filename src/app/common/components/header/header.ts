import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderConfig, DEFAULT_HEADER_CONFIG } from './header.config';
import { SessionService } from '../../services';
import { ROLE_NAMES } from 'src/app/modules/auth/models';
import { AuthService } from '../../../modules/auth/services/auth.service'; 
import { ConfirmationModel, ConfirmationModelConfig } from '@common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ConfirmationModel],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  @Input() config: HeaderConfig = DEFAULT_HEADER_CONFIG;
  @Output() menuToggle = new EventEmitter<void>();

  sessionService = inject(SessionService);
  private authService = inject(AuthService);

  userRole: string = '';
  initials: string = '';
  currentDate: string = '';

  isProfileOpen = false;
  showLogoutConfirmation = false;
  logoutConfig: ConfirmationModelConfig = {
    title: 'Confirm Logout',
    message: 'Are you sure you want to log out?',
    cancelText: 'Cancel',
    confirmText: 'Logout',
  };

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadUserFromSession();
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  toggleProfileDropdown(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  logout(): void {
    this.isProfileOpen = false;
    this.showLogoutConfirmation = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirmation = false;
    this.authService.logout();
  }

  cancelLogout(): void {
    this.showLogoutConfirmation = false;
  }

  private setCurrentDate(): void {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.currentDate = new Date().toLocaleDateString('en-US', options);
  }

  private loadUserFromSession(): void {
    const name = this.sessionService.name ?? '';
    const roleId = this.sessionService.roleId;

    if (name) {
      this.initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }

    if (roleId !== null) {
      this.userRole = ROLE_NAMES[roleId] ?? '';
    }
  }
}