import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PublicHolidayService } from '../../../../services/public-holiday.service';
import { HolidayResponse } from '../../../../models/leave.model';
import { PaginationComponent } from '@common';
import { DEFAULT_PAGINATION } from '../../../../constants/app.constants';

@Component({
  selector: 'app-public-holiday-list',
  imports: [CommonModule, PaginationComponent],
  templateUrl: './public-holiday-list.html',
  styleUrl: './public-holiday-list.css',
})
export class PublicHolidayList implements OnInit {
  private svc = inject(PublicHolidayService);
  private toastr = inject(ToastrService);

  holidays: HolidayResponse[] = [];
  totalItems = 0;
  isLoading = false;

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.isLoading = true;
    const params: Record<string, string> = {
      pageNumber: this.currentPage.toString(),
      pageSize: this.itemsPerPage.toString(),
    };
    this.svc.getAll(params).subscribe({
      next: (res) => {
        this.holidays = res.data?.items ?? [];
        this.totalItems = res.data?.totalCount ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHolidays();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadHolidays();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  getDayName(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long' });
  }
}