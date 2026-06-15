import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from '../../services/leave.service';
import { LeaveResponse, ApprovalStatus, ReviewLeaveRequest } from '../../models/leave.model';
import { PaginationComponent, Button, ButtonInputConfig } from '@common';
import { DEFAULT_PAGINATION } from '../../constants/app.constants';

@Component({
  selector: 'app-leave-review-panel',
  imports: [CommonModule, FormsModule, PaginationComponent, Button],
  templateUrl: './leave-review-panel.html',
  styleUrl: './leave-review-panel.css',
})
export class LeaveReviewPanel implements OnInit {
  private svc = inject(LeaveService);
  private toastr = inject(ToastrService);

  readonly ApprovalStatus = ApprovalStatus;

  records: LeaveResponse[] = [];
  totalItems = 0;
  isLoading = false;
  remarkMap: Record<number, string> = {};

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.currentPage = 1;
    this.fetchPage();
  }

  private fetchPage(): void {
    this.isLoading = true;
    const params: Record<string, string> = {
      pageNumber: this.currentPage.toString(),
      pageSize: this.itemsPerPage.toString(),
    };

    this.svc.getPendingForReview(params).subscribe({
      next: (res) => {
        this.records = res.data?.items ?? [];
        this.totalItems = res.data?.totalCount ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error?.getErrorMessage);
        this.isLoading = false;
      },
    });
  }

  approve(record: LeaveResponse): void {
    this.submitReview(record.id, ApprovalStatus.Approved);
  }

  reject(record: LeaveResponse): void {
    this.submitReview(record.id, ApprovalStatus.Rejected);
  }

  private submitReview(id: number, status: ApprovalStatus): void {
    const request: ReviewLeaveRequest = {
      leaveStatus: status,
      reviewerRemark: this.remarkMap[id]?.trim() || null,
    };
    this.svc.review(id, request).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        delete this.remarkMap[id];
        this.fetchPage();
      },
      error: (err) => this.toastr.error(err?.error?.getErrorMessage),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchPage();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.fetchPage();
  }

  getRejectConfig(record: LeaveResponse): ButtonInputConfig {
    return { variant: 'close', text: 'Reject', onClick: () => this.reject(record) };
  }

  getApproveConfig(record: LeaveResponse): ButtonInputConfig {
    return { variant: 'save', text: 'Approve', onClick: () => this.approve(record) };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  trackById(_: number, item: LeaveResponse): number {
    return item.id;
  }
}