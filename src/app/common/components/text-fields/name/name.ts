import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { NameFieldConfig } from './name.config';

@Component({
  selector: 'app-name-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './name.html',
  styleUrls: ['./name.css'],
})
export class NameField implements OnInit {
  @Input() config!: NameFieldConfig;

  formGroup!: FormGroup;
  private controlContainer = inject(ControlContainer);

  ngOnInit(): void {
    this.formGroup = this.controlContainer.control as FormGroup;
  }

  get control(): AbstractControl {
    return this.formGroup.get(this.config.formControlName) as AbstractControl;
  }

  get isTouched(): boolean {
    return !!this.control?.touched;
  }

  get isInvalid(): boolean {
    return !!this.control?.invalid;
  }
}
