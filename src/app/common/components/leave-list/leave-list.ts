import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from '../../services/leave.service';
import { LeaveResponse, ApprovalStatus, ApplyLeaveRequest, EditLeaveRequest, LEAVE_STATUS_LABELS } from '../../models/leave.model';
import { PaginationComponent, Button, ButtonInputConfig, ConfirmationModel, ConfirmationModelConfig } from '@common';
import { LeaveApplyModal } from './component/leave-apply-modal/leave-apply-modal';
import { DEFAULT_PAGINATION } from '../../constants/app.constants';

@Component({
  selector: 'app-leave-list',
  imports: [CommonModule, PaginationComponent, Button, LeaveApplyModal, ConfirmationModel],
  templateUrl: './leave-list.html',
  styleUrl: './leave-list.css',
})
export class LeaveList implements OnInit {
  private svc = inject(LeaveService);
  private toastr = inject(ToastrService);

  readonly ApprovalStatus = ApprovalStatus;
  readonly statusLabels = LEAVE_STATUS_LABELS;

  leaves: LeaveResponse[] = [];
  totalItems = 0;
  isLoading = false;
  isModalLoading = false;

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;

  showModal = false;
  selectedLeave: LeaveResponse | null = null;
  activeDropdownId: number | null = null;

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  showDeleteConfirm = false;
  leaveToDelete: LeaveResponse | null = null;
  isDeleting = false;
  deleteConfirmConfig: ConfirmationModelConfig = {
    title: 'Delete Leave Request',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Delete',
  };

  showTooltip(event: MouseEvent, text: string): void {
    this.tooltip = { visible: true, text, x: event.clientX, y: event.clientY };
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  applyBtnConfig!: ButtonInputConfig;
  getPublicHolidayConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.applyBtnConfig = {
      variant: 'add',
      text: '+ Apply',
      onClick: () => this.openAddModal(),
    };
    this.getPublicHolidayConfig = {
      variant: 'save',
      text: 'Holidays List',
    };
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.isLoading = true;
    const params: Record<string, string> = {
      pageNumber: this.currentPage.toString(),
      pageSize: this.itemsPerPage.toString(),
    };
    this.svc.getMyLeaves(params).subscribe({
      next: (res) => {
        this.leaves = res.data?.items ?? [];
        this.totalItems = res.data?.totalCount ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isLoading = false;
      },
    });
  }

  openAddModal(): void {
    this.selectedLeave = null;
    this.showModal = true;
  }

  openEditModal(leave: LeaveResponse): void {
    this.selectedLeave = leave;
    this.showModal = true;
    this.activeDropdownId = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLeave = null;
  }

  onSave(payload: ApplyLeaveRequest | EditLeaveRequest): void {
    this.isModalLoading = true;
    const isEdit = !!this.selectedLeave;
    const req$ = isEdit
      ? this.svc.edit(this.selectedLeave!.id, payload as EditLeaveRequest)
      : this.svc.apply(payload as ApplyLeaveRequest);

    req$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isModalLoading = false;
        this.closeModal();
        this.loadLeaves();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isModalLoading = false;
      },
    });
  }

  toggleDropdown(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  closeDropdown(): void {
    this.activeDropdownId = null;
  }

  openDeleteConfirm(leave: LeaveResponse): void {
    this.leaveToDelete = leave;
    this.deleteConfirmConfig = {
      title: 'Delete Leave Request',
      message: `Are you sure you want to delete this ${leave.leaveTypeDisplay} leave request from ${this.formatDate(leave.startDate)} to ${this.formatDate(leave.endDate)}?`,
      cancelText: 'Cancel',
      confirmText: 'Delete',
    };
    this.showDeleteConfirm = true;
    this.activeDropdownId = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.leaveToDelete = null;
  }

  confirmDelete(): void {
    if (!this.leaveToDelete) return;
    this.isDeleting = true;
    this.svc.delete(this.leaveToDelete.id).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.leaveToDelete = null;
        const remaining = this.totalItems - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / this.itemsPerPage));
        if (this.currentPage > maxPage) this.currentPage = maxPage;
        this.loadLeaves();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.leaveToDelete = null;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLeaves();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadLeaves();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  private getErrorMessage(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message ?? 'Something went wrong.';
  }
}