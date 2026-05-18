import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from './services/employee.service';
import { DeleteModel, PaginationComponent } from '@common';
import { EmployeeAddeditModal } from './components/employee-addedit-modal/employee-addedit-modal';
import { createDeleteConfig } from '../../../common/components/delete-model/delete-model.config';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';
import { Employee, EMPLOYEE_ROLE_LABELS, CreateEmployeeRequest, UpdateEmployeeRequest, UserSummary } from './models/employee.model';

type TabType = 'all' | 'assigned' | 'unassigned';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, DeleteModel, EmployeeAddeditModal, PaginationComponent],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class EmployeeModule implements OnInit {
  private employeeService = inject(EmployeeService);
  private toastr = inject(ToastrService);

  employees: Employee[] = [];
  isLoading = false;
  isModalLoading = false;
  isDeleteLoading = false;

  activeTab: TabType = 'all';

  summary: UserSummary = { totalEmployees: 0, assignedCount: 0, unassignedCount: 0 };

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  showModal = false;
  selectedEmployee: Employee | null = null;

  showDeleteModal = false;
  deleteConfig = createDeleteConfig('');
  employeeToDeleteId: number | null = null;

  readonly roleLabels = EMPLOYEE_ROLE_LABELS;

  setTab(tab: TabType): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadEmployees();
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.isLoading = true;
    this.employeeService
      .getAll({
        pageNumber: this.currentPage,
        pageSize: this.itemsPerPage,
        filter: this.activeTab,
      })
      .subscribe({
        next: (res) => {
          this.employees = res.data?.items ?? [];
          this.totalItems = res.data?.totalCount ?? 0;
          if (res.data?.summary) {
            this.summary = res.data.summary;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(this.getErrorMessage(err));
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEmployees();
  }
  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadEmployees();
  }

  openAddModal(): void {
    this.selectedEmployee = null;
    this.showModal = true;
  }
  openEditModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showModal = true;
  }
  closeModal(): void {
    this.showModal = false;
    this.selectedEmployee = null;
  }

  onSave(payload: CreateEmployeeRequest | UpdateEmployeeRequest): void {
    this.isModalLoading = true;
    const isEdit = !!this.selectedEmployee;
    const request$ = isEdit
      ? this.employeeService.update(this.selectedEmployee!.userId, payload as UpdateEmployeeRequest)
      : this.employeeService.create(payload as CreateEmployeeRequest);
    request$.subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isModalLoading = false;
        this.closeModal();
        this.loadEmployees();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isModalLoading = false;
      },
    });
  }

  openDeleteModal(employee: Employee): void {
    this.employeeToDeleteId = employee.userId;
    this.deleteConfig = createDeleteConfig(employee.name);
    this.showDeleteModal = true;
  }
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.employeeToDeleteId = null;
  }

  onConfirmDelete(): void {
    if (!this.employeeToDeleteId) return;
    this.isDeleteLoading = true;
    this.employeeService.delete(this.employeeToDeleteId).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.isDeleteLoading = false;
        this.closeDeleteModal();
        if (this.employees.length === 1 && this.currentPage > 1) this.currentPage--;
        this.loadEmployees();
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err));
        this.isDeleteLoading = false;
      },
    });
  }

  getRoleLabel(roleId: number): string {
    return this.roleLabels[roleId] ?? '—';
  }

  private getErrorMessage(err: any): string {
    const body = err?.error;
    if (body?.errorMessages?.length) return body.errorMessages.join(' ');
    return body?.message;
  }
}
