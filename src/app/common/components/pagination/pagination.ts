import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEFAULT_PAGINATION } from '../../../common/constants/app.constants';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent {

  @Input() currentPage = DEFAULT_PAGINATION.currentPage;
  @Input() totalItems = DEFAULT_PAGINATION.totalItems;
  @Input() itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeOptions = DEFAULT_PAGINATION.pageSizeOptions;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  changePageSize(size: number | string) {
    const newSize = Number(size);
    if (!isNaN(newSize) && newSize > 0) {
      this.pageSizeChange.emit(newSize);
    }
  }
}