import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { EmployeeTaskSummary, TopEmployeeTask, ReportFilter } from '../../models/report.model';
import { SearchBarComponent } from 'src/app/common/components/search-bar/search-bar';
import { PaginationComponent } from 'src/app/common/components/pagination/pagination';
import { DEFAULT_PAGINATION } from 'src/app/common/constants/app.constants';

@Component({
  selector: 'app-employee-performnace-report',
  imports: [CommonModule, SearchBarComponent, PaginationComponent],
  templateUrl: './employee-performnace-report.html',
  styleUrl: './employee-performnace-report.css',
})
export class EmployeePerformnaceReport implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly toastr = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('barCanvas') private barCanvas!: ElementRef<HTMLCanvasElement>;

  topEmployees: TopEmployeeTask[] = [];
  selectedFilter: ReportFilter = 'monthly';
  isChartLoading = false;

  pagedEmployees: EmployeeTaskSummary[] = [];
  searchQuery = '';
  currentPage = DEFAULT_PAGINATION.currentPage;
  pageSize = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;
  isGridLoading = false;

  private readonly BAR_COLORS = {
    pending: '#93c5fd',
    inProgress: '#6ee7b7',
    completed: '#22c55e',
    onHold: '#fef08a',
  };

  ngOnInit(): void {
    this.loadChart();
    this.loadGrid();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    setTimeout(() => this.drawChart(), 60);
  }

  onFilterChange(filter: ReportFilter): void {
    if (this.selectedFilter === filter) return;
    this.selectedFilter = filter;
    this.loadChart();
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

  getBarColor(rate: number): string {
    return rate >= 75 ? '#7c3aed' : rate >= 40 ? '#3b82f6' : '#9ca3af';
  }

  private loadChart(): void {
    this.isChartLoading = true;
    this.reportService
      .getPerformanceReport(this.selectedFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.topEmployees = res.data?.topEmployees ?? [];
          this.isChartLoading = false;
          setTimeout(() => this.drawChart(), 80);
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
      .getEmployeeSummary(this.currentPage, this.pageSize, this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.pagedEmployees = res.data?.items ?? [];
          this.totalItems = res.data?.totalCount ?? 0;
          this.isGridLoading = false;
        },
        error: (err) => {
          this.toastr.error(err?.error?.message);
          this.isGridLoading = false;
        },
      });
  }

  private drawChart(): void {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas || !this.topEmployees.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalW = (canvas.parentElement?.clientWidth ?? 620) - 32;
    const numBars  = this.topEmployees.length;
    const logicalH = numBars * 52 + 60;

    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width  = `${logicalW}px`;
    canvas.style.height = `${logicalH}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const pL = 100, pR = 50, pT = 20, pB = 36;
    const chartW = logicalW - pL - pR;
    const chartH = logicalH - pT - pB;
    const barH = 26;
    const slotH  = chartH / numBars;
    const maxVal = Math.max(...this.topEmployees.map(e => e.total), 1);

    // Grid lines + x-axis labels
    for (let i = 0; i <= 5; i++) {
      const x = pL + (i / 5) * chartW;
      ctx.strokeStyle = i === 0 ? '#9ca3af' : '#e5e7eb';
      ctx.lineWidth   = i === 0 ? 1.5 : 1;
      ctx.setLineDash(i === 0 ? [] : [4, 3]);
      ctx.beginPath();
      ctx.moveTo(x, pT);
      ctx.lineTo(x, pT + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px Inter,system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(Math.round((i / 5) * maxVal)), x, pT + chartH + 18);
    }

    this.topEmployees.forEach((emp, idx) => {
      const y = pT + idx * slotH + (slotH - barH) / 2;
      const segs = [
        { count: emp.completed, color: this.BAR_COLORS.completed },
        { count: emp.inProgress, color: this.BAR_COLORS.inProgress },
        { count: emp.onHold, color: this.BAR_COLORS.onHold },
        { count: emp.pending, color: this.BAR_COLORS.pending },
      ];

      ctx.fillStyle = '#f3f4f6';
      this.rrect(ctx, pL, y, chartW, barH, 6);
      ctx.fill();

      const lastIdx = segs.reduce((li, s, i) => s.count > 0 ? i : li, -1);
      let xOff = pL;
      segs.forEach((seg, si) => {
        if (seg.count <= 0) return;
        const w = (seg.count / maxVal) * chartW;
        ctx.fillStyle = seg.color;
        this.rrectSeg(ctx, xOff, y, w, barH, 6, xOff === pL, si === lastIdx);
        ctx.fill();
        xOff += w;
      });

      ctx.fillStyle = '#111827';
      ctx.font  = '12px Inter,system-ui,sans-serif';
      ctx.textAlign = 'right';
      let name = emp.employeeName;
      while (ctx.measureText(name).width > pL - 10 && name.length > 4)
        name = name.slice(0, -2);
      if (name !== emp.employeeName) name += '…';
      ctx.fillText(name, pL - 8, y + barH / 2 + 4);

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px Inter,system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(String(emp.total), pL + (emp.total / maxVal) * chartW + 6, y + barH / 2 + 4);
    });
  }

  private rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private rrectSeg(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
    roundL: boolean, roundR: boolean
  ): void {
    const tl = roundL ? r : 0, bl = roundL ? r : 0;
    const tr = roundR ? r : 0, br = roundR ? r : 0;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.arcTo(x + w, y, x + w, y + h, tr);
    ctx.arcTo(x + w, y + h, x, y + h, br);
    ctx.arcTo(x, y + h, x, y, bl);
    ctx.arcTo(x, y, x + w, y, tl);
    ctx.closePath();
  }
}