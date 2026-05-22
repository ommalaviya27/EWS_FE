import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteModelConfig } from './delete-model.config';
import { Button, ButtonInputConfig } from '@common';

@Component({
  selector: 'app-delete-model',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './delete-model.html',
  styleUrl: './delete-model.css',
})
export class DeleteModel implements OnChanges {
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

  cancelBtnConfig!: ButtonInputConfig;
  deleteBtnConfig!: ButtonInputConfig;

  ngOnChanges(changes: SimpleChanges): void {
    this.initButtonConfigs();
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      variant: 'close',
      text: this.config?.cancelText || 'Cancel',
      onClick: () => this.onCancel()
    };

    this.deleteBtnConfig = {
      variant: 'delete',
      text: this.config?.deleteText || 'Delete',
      isLoading: this.isLoading,
      disabled: this.isLoading,
      onClick: () => this.onDelete()
    };
  }

  onDelete(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }
}