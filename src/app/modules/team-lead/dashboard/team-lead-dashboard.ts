import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { SessionService } from '../../../common/services/session.service';

@Component({
  selector: 'app-team-lead-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-lead-dashboard.html',
  styleUrls: ['./team-lead-dashboard.css'],
})
export class TeamLeadDashboardComponent {
  private authService = inject(AuthService);
  sessionService = inject(SessionService);

  logout(): void {
    this.authService.logout();
  }
}