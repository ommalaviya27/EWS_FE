import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PublicHolidayService } from './services/public-holiday.service';
import { HolidayResponse, CreateHolidayRequest, UpdateHolidayRequest } from './models/public-holiday.model';
import { PaginationComponent, Button, ButtonInputConfig, ConfirmationModel, ConfirmationModelConfig } from '@common';
import { PublicHolidayModal } from './components/public-holiday-modal/public-holiday-modal';
import { DEFAULT_PAGINATION } from '@constants';

@Component({
  selector: 'app-public-holiday',
  imports: [CommonModule, PaginationComponent, Button, ConfirmationModel, PublicHolidayModal],
  templateUrl: './public-holiday.html',
  styleUrl: './public-holiday.css',
})
export class PublicHoliday implements OnInit {
  private svc = inject(PublicHolidayService);
  private toastr = inject(ToastrService);

  holidays: HolidayResponse[] = [];
  totalItems = 0;
  isLoading = false;
  isModalLoading = false;

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;

  showModal = false;
  selectedHoliday: HolidayResponse | null = null;

  activeDropdownId: string | null = null;

  showDeleteConfirm = false;
  holidayToDelete: HolidayResponse | null = null;
  isDeleting = false;
  deleteConfirmConfig: ConfirmationModelConfig = {
    title: 'Delete Public Holiday',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Delete',
  };

  addBtnConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.addBtnConfig = {
      variant: 'add',
      text: '+ Add',
      onClick: () => this.openAddModal(),
    };
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

  openAddModal(): void {
    this.selectedHoliday = null;
    this.showModal = true;
  }

  openEditModal(holiday: HolidayResponse): void {
    this.selectedHoliday = holiday;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedHoliday = null;
  }

  onSave(payload: CreateHolidayRequest | UpdateHolidayRequest): void {
    this.isModalLoading = true;
    const isEdit = !!this.selectedHoliday;
    const req$ = isEdit
      ? this.svc.update(this.selectedHoliday!.id, payload as UpdateHolidayRequest)
      : this.svc.create(payload as CreateHolidayRequest);

    req$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isModalLoading = false;
        this.closeModal();
        this.loadHolidays();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.isModalLoading = false;
      },
    });
  }

  openDeleteConfirm(holiday: HolidayResponse): void {
    this.holidayToDelete = holiday;
    this.deleteConfirmConfig = {
      title: 'Delete Public Holiday',
      message: `Are you sure you want to delete "${holiday.name}" (${this.formatDate(holiday.holidayDate)})?`,
      cancelText: 'Cancel',
      confirmText: 'Delete',
    };
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.holidayToDelete = null;
  }

  confirmDelete(): void {
    if (!this.holidayToDelete) return;
    this.isDeleting = true;
    this.svc.delete(this.holidayToDelete.id).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.holidayToDelete = null;
        const remaining = this.totalItems - 1;
        const maxPage = Math.max(1, Math.ceil(remaining / this.itemsPerPage));
        if (this.currentPage > maxPage) this.currentPage = maxPage;
        this.loadHolidays();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.holidayToDelete = null;
      },
    });
  }

  onPageChange(page: number): void {
    this.closeDropdown();
    this.currentPage = page;
    this.loadHolidays();
  }

  onPageSizeChange(size: number): void {
    this.closeDropdown();
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadHolidays();
  }
  toggleDropdown(event: MouseEvent, holidayId: string): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === holidayId ? null : holidayId;
  }

  closeDropdown(): void {
    this.activeDropdownId = null;
  }

  onActionClick(event: MouseEvent, action: 'edit' | 'delete', holiday: HolidayResponse): void {
    event.stopPropagation();
    this.closeDropdown();

    if (action === 'edit') {
      this.openEditModal(holiday);
    } else if (action === 'delete') {
      this.openDeleteConfirm(holiday);
    }
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