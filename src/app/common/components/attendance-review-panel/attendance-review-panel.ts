import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceResponse, ApprovalStatus, ReviewAttendanceRequest } from '../../models/attendance.model';
import { PaginationRequest, PaginationResponse } from '../pagination/pagination.model';
import { PaginationComponent, Button, ButtonInputConfig} from '@common';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';

@Component({
  selector: 'app-attendance-review-panel',
  imports: [CommonModule, FormsModule, PaginationComponent, Button],
  templateUrl: './attendance-review-panel.html',
  styleUrl: './attendance-review-panel.css',
})
export class AttendanceReviewPanel implements OnInit {
  private svc = inject(AttendanceService);
  private toastr = inject(ToastrService);

  readonly ApprovalStatus = ApprovalStatus;

  pagedResult: PaginationResponse<AttendanceResponse> | null = null;
  isLoading = false;
  remarkMap: Record<number, string> = {};

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;

  getRejectConfig(record: any): ButtonInputConfig {
    return {
      type: 'button',
      variant: 'close',
      text: 'Reject',
      onClick: () => this.reject(record)
    };
  }

  getApproveConfig(record: any): ButtonInputConfig {
    return {
      type: 'button',
      variant: 'save',
      text: 'Approve',
      onClick: () => this.approve(record)
    };
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.currentPage = 1;
    this.fetchPage();
  }

  private fetchPage(): void {
    this.isLoading = true;
    const pagination: PaginationRequest = {
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
    };
    this.svc.getPendingForReview(pagination).subscribe({
      next: (res) => {
        this.pagedResult = res.data ?? null;
        this.isLoading = false;
      },
      error: (e) => {
        this.toastr.error(e?.error?.message);
        this.isLoading = false;
      },
    });
  }

  get records(): AttendanceResponse[] {
    return this.pagedResult?.items ?? [];
  }

  get totalItems(): number {
    return this.pagedResult?.totalCount ?? 0;
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

  approve(record: AttendanceResponse): void {
    this.review(record, ApprovalStatus.Approved);
  }

  reject(record: AttendanceResponse): void {
    this.review(record, ApprovalStatus.Rejected);
  }

  private review(record: AttendanceResponse, approvalStatus: ApprovalStatus): void {
    const req: ReviewAttendanceRequest = {
      approvalStatus,
      reviewerRemark: this.remarkMap[record.id] || undefined,
    };
    this.svc.review(record.id, req).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        const remainingOnPage = this.records.length - 1;
        if (remainingOnPage === 0 && this.currentPage > 1) this.currentPage--;
        this.fetchPage();
      },
      error: (e) => this.toastr.error(e?.error?.message),
    });
  }

  trackById(_: number, item: AttendanceResponse): number {
    return item.id;
  }
}
