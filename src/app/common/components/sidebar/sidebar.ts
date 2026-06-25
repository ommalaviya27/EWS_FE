import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SidebarConfig, SidebarNavItem, ROLE_SIDEBAR_CONFIGS } from './sidebar.config';
import { ROLE_NAMES } from '../../../modules/auth/models/auth.model';
import { SessionService } from '@services';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  config!: SidebarConfig;
  userName: string = '';
  userEmail: string = '';
  userRoleName: string = '';
  initials: string = '';
  isOpen: boolean = false;

  expandedGroups: Set<string> = new Set();

  ngOnInit(): void {
    this.loadUserAndConfig();

    this.autoExpandActive(this.router.url);

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((e: any) => this.autoExpandActive(e.urlAfterRedirects ?? e.url));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void { this.isOpen = !this.isOpen; }
  close(): void  { this.isOpen = false; }

  isGroup(item: SidebarNavItem): boolean {
    return !item.route && !!item.children?.length;
  }

  toggleGroup(label: string): void {
    this.expandedGroups.has(label)
      ? this.expandedGroups.delete(label)
      : this.expandedGroups.add(label);
  }

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups.has(label);
  }

  isGroupActive(item: SidebarNavItem): boolean {
    const url = this.router.url;
    return (item.children ?? []).some((c) => c.route && url.startsWith(c.route));
  }

  private autoExpandActive(url: string): void {
    if (!this.config) return;
    this.config.navItems.forEach((item) => {
      if (this.isGroup(item)) {
        const hasActive = (item.children ?? []).some(
          (c) => c.route && url.startsWith(c.route)
        );
        if (hasActive) this.expandedGroups.add(item.label);
      }
    });
  }

  private loadUserAndConfig(): void {
    const name   = this.sessionService.name ?? '';
    const email  = this.sessionService.email ?? '';
    const roleId = this.sessionService.roleId;

    this.userName  = name;
    this.userEmail = email;

    if (roleId !== null) {
      this.config      = ROLE_SIDEBAR_CONFIGS[roleId];
      this.userRoleName = ROLE_NAMES[roleId] ?? '';
    }

    if (name) {
      this.initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
  }
}