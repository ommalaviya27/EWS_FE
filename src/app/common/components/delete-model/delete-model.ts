import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteModelConfig } from './delete-model.config';

@Component({
  selector: 'app-delete-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-model.html',
  styleUrl: './delete-model.css',
})
export class DeleteModel {
  @Input() visible = false;
  @Input() isLoading = false;

  @Input() config: DeleteModelConfig = {
    title: '',
    message: '',
    cancelText: 'Cancel',
    deleteText: 'Delete',
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onDelete(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }
}