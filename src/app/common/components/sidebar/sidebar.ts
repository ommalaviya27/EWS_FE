import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarConfig, ROLE_SIDEBAR_CONFIGS } from './sidebar.config';
import { ROLE_NAMES } from '../../../modules/auth/models/auth.model';
import { SessionService } from '../../services';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { ConfirmationModel, ConfirmationModelConfig } from '@common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModel],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  config!: SidebarConfig;
  userName: string = '';
  userEmail: string = '';
  userRoleName: string = '';
  initials: string = '';
  isOpen: boolean = false;

  showLogoutConfirmation = false;
  logoutConfig: ConfirmationModelConfig = {
    title: 'Confirm Logout',
    message: 'Are you sure you want to log out?',
    cancelText: 'Cancel',
    confirmText: 'Logout',
  };

  ngOnInit(): void {
    this.loadUserAndConfig();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  logout(): void {
    this.showLogoutConfirmation = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirmation = false;
    this.authService.logout();
  }

  cancelLogout(): void {
    this.showLogoutConfirmation = false;
  }

  private loadUserAndConfig(): void {
    const name = this.sessionService.name ?? '';
    const email = this.sessionService.email ?? '';
    const roleId = this.sessionService.roleId;

    this.userName = name;
    this.userEmail = email;

    if (roleId !== null) {
      this.config = ROLE_SIDEBAR_CONFIGS[roleId];
      this.userRoleName = ROLE_NAMES[roleId] ?? '';
    }

    if (name) {
      this.initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
  }
}