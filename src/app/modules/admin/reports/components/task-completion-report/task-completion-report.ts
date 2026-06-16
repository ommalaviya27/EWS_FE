import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { TaskCompletionOverview, TaskCompletionSummaryItem, ReportFilter } from '../../models/report.model';
import { SearchBarComponent } from 'src/app/common/components/search-bar/search-bar';
import { PaginationComponent } from 'src/app/common/components/pagination/pagination';
import { DEFAULT_PAGINATION } from 'src/app/common/constants/app.constants';

@Component({
  selector: 'app-task-completion-report',
  imports: [CommonModule, SearchBarComponent, PaginationComponent],
  templateUrl: './task-completion-report.html',
  styleUrl: './task-completion-report.css',
})
export class TaskCompletionReport implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly toastr = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('statusPieCanvas') private statusPieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityPieCanvas') private priorityPieCanvas!: ElementRef<HTMLCanvasElement>;

  overview: TaskCompletionOverview | null = null;
  selectedFilter: ReportFilter = 'monthly';
  isChartLoading = false;

  pagedTasks: TaskCompletionSummaryItem[] = [];
  searchQuery = '';
  currentPage = DEFAULT_PAGINATION.currentPage;
  pageSize = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;
  isGridLoading = false;

  private readonly STATUS_COLORS = {
    pending: '#93c5fd',
    inProgress: '#6ee7b7',
    completed: '#22c55e',
    onHold: '#fef08a',
  };

  private readonly PRIORITY_COLORS = {
    low: '#93c5fd',
    medium: '#fbbf24',
    high: '#f87171',
  };

  ngOnInit(): void {
    this.loadCharts();
    this.loadGrid();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    setTimeout(() => {
      this.drawStatusPie();
      this.drawPriorityPie();
    }, 60);
  }

  onFilterChange(filter: ReportFilter): void {
    if (this.selectedFilter === filter) return;
    this.selectedFilter = filter;
    this.loadCharts();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadGrid();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadGrid();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadGrid();
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge--pending',
      InProgress: 'badge--progress',
      Completed: 'badge--done',
      OnHold: 'badge--hold',
    };
    return map[status] ?? 'badge--pending';
  }

  getPriorityBadgeClass(priority: string): string {
    const map: Record<string, string> = {
      Low: 'badge--low',
      Medium: 'badge--medium',
      High: 'badge--high',
    };
    return map[priority] ?? 'badge--medium';
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      InProgress: 'In Progress',
      OnHold: 'On Hold',
    };
    return map[status] ?? status;
  }

  private loadCharts(): void {
    this.isChartLoading = true;
    this.reportService
      .getTaskCompletionOverview(this.selectedFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.overview = res.data ?? null;
          this.isChartLoading = false;
          setTimeout(() => {
            this.drawStatusPie();
            this.drawPriorityPie();
          }, 80);
        },
        error: (err) => {
          this.toastr.error(err?.error?.message);
          this.isChartLoading = false;
        },
      });
  }

  private loadGrid(): void {
    this.isGridLoading = true;
    this.reportService
      .getTaskCompletionSummary(this.currentPage, this.pageSize, this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.pagedTasks = res.data?.items ?? [];
          this.totalItems = res.data?.totalCount ?? 0;
          this.isGridLoading = false;
        },
        error: (err) => {
          this.toastr.error(err?.error?.message);
          this.isGridLoading = false;
        },
      });
  }

  private drawStatusPie(): void {
    if (!this.overview) return;
    const s = this.overview.statusDistribution;
    const slices = [
      { label: 'Pending', value: s.pending, color: this.STATUS_COLORS.pending },
      { label: 'In Progress', value: s.inProgress, color: this.STATUS_COLORS.inProgress },
      { label: 'Completed', value: s.completed, color: this.STATUS_COLORS.completed },
      { label: 'On Hold', value: s.onHold, color: this.STATUS_COLORS.onHold },
    ];
    this.drawDonut(this.statusPieCanvas?.nativeElement, slices, s.total);
  }

  private drawPriorityPie(): void {
    if (!this.overview) return;
    const p = this.overview.priorityDistribution;
    const slices = [
      { label: 'Low', value: p.low, color: this.PRIORITY_COLORS.low },
      { label: 'Medium', value: p.medium, color: this.PRIORITY_COLORS.medium },
      { label: 'High', value: p.high, color: this.PRIORITY_COLORS.high },
    ];
    this.drawDonut(this.priorityPieCanvas?.nativeElement, slices, p.total);
  }

  private drawDonut(
    canvas: HTMLCanvasElement | undefined,
    slices: { label: string; value: number; color: string }[],
    total: number
  ): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.parentElement?.clientWidth
      ? Math.min(canvas.parentElement.clientWidth - 32, 200)
      : 180;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    if (total === 0) return;

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * 0.58;
    const gap = 0.025; // gap between slices in radians

    let startAngle = -Math.PI / 2;

    slices.forEach((slice) => {
      if (slice.value === 0) return;
      const sweep = (slice.value / total) * 2 * Math.PI - gap;
      ctx.beginPath();
      ctx.moveTo(
        cx + innerR * Math.cos(startAngle + gap / 2),
        cy + innerR * Math.sin(startAngle + gap / 2)
      );
      ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + sweep + gap / 2);
      ctx.arc(cx, cy, innerR, startAngle + sweep + gap / 2, startAngle + gap / 2, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += sweep + gap;
    });

    // Center label — total count
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${Math.round(size * 0.16)}px Inter,system-ui,sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy - size * 0.04);
    ctx.fillStyle = '#6b7280';
    ctx.font = `${Math.round(size * 0.09)}px Inter,system-ui,sans-serif`;
    ctx.fillText('Total', cx, cy + size * 0.1);
  }
}