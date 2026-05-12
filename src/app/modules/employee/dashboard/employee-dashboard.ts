import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { SessionService } from '../../../common/services/session.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css'],
})
export class EmployeeDashboardComponent {
  private authService = inject(AuthService);
  sessionService = inject(SessionService);

  logout(): void {
    this.authService.logout();
  }
}
