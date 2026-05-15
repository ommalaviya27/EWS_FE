import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderConfig, DEFAULT_HEADER_CONFIG } from './header.config';
import { SessionService } from '../../services';
import { ROLE_NAMES } from 'src/app/modules/auth/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  @Input() config: HeaderConfig = DEFAULT_HEADER_CONFIG;
  @Output() menuToggle = new EventEmitter<void>();

  sessionService = inject(SessionService);

  userRole: string = '';
  initials: string = '';
  currentDate: string = '';

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadUserFromSession();
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
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
      this.initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }

    if (roleId !== null) {
      this.userRole = ROLE_NAMES[roleId] ?? '';
    }
  }
}