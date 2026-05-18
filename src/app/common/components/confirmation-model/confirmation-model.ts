import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationModelConfig } from './confirmation-model.config.js';

@Component({
  selector: 'app-confirmation-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-model.html',
  styleUrl: './confirmation-model.css',
})
export class ConfirmationModel {
  @Input() visible = false;

  @Input() config: ConfirmationModelConfig = {
    title: '',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Delete',
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onSave(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }
}
