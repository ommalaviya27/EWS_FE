import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, TeamLeader, ProjectStatus, PROJECT_STATUS_LIST, CreateProjectRequest, UpdateProjectRequest } from '../../models/project.model';
import { NameFieldConfig, Name, Description, DescriptionFieldConfig, Button, ButtonInputConfig } from '@common';

@Component({
  selector: 'app-project-addedit-modal',
  imports: [CommonModule, ReactiveFormsModule, Name, Description, Button],
  templateUrl: './project-addedit-modal.html',
  styleUrl: './project-addedit-modal.css',
})
export class ProjectAddeditModal implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isLoading = false;
  @Input() project: Project | null = null;
  @Input() teamLeaders: TeamLeader[] = [];

  @Output() save = new EventEmitter<CreateProjectRequest | UpdateProjectRequest>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  nameConfig!: NameFieldConfig;
  descriptionConfig!: DescriptionFieldConfig;
  form!: FormGroup;
  statusList = PROJECT_STATUS_LIST;

  cancelBtnConfig!: ButtonInputConfig;
  submitBtnConfig!: ButtonInputConfig;

  get isEditMode(): boolean {
    return this.project !== null;
  }

  ngOnInit(): void {
    this.buildForm();
    this.initConfigs();
    this.initButtonConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.buildForm();
    }
    this.initButtonConfigs();
  }

  private initConfigs(): void {
    this.nameConfig = {
      formControlName: 'name',
      placeholder: 'Project name',
    };
    this.descriptionConfig = {
      formControlName: 'description',
      placeholder: 'Description',
      rows: 1,
    };
  }

  private initButtonConfigs(): void {
    this.cancelBtnConfig = {
      type: 'button',
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.onCancel()
    };

    this.submitBtnConfig = {
      type: 'submit',
      variant: 'save',
      text: this.isEditMode ? 'Update Project' : 'Create Project',
      isLoading: this.isLoading,
      disabled: this.isLoading
    };
  }

  private buildForm(): void {
    const p = this.project;
    this.form = this.fb.group({
      name: [
        p?.name ?? '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      description: [
        p?.description ?? '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
      ],
      userId: [p?.userId ?? null, [Validators.required]],
      startDate: [p ? this.toDateInput(p.startDate) : '', [Validators.required]],
      endDate: [p ? this.toDateInput(p.endDate) : '', [Validators.required]],
      projectStatus: [p?.projectStatus ?? ProjectStatus.Active, [Validators.required]],
    });
  }

  today: string = new Date().toISOString().split('T')[0];

  private toDateInput(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().substring(0, 10);
  }

  get minEndDate(): string {
    const startDate = this.form?.get('startDate')?.value;
    return startDate ? startDate : this.today;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;
    const payload: CreateProjectRequest | UpdateProjectRequest = {
      ...(this.isEditMode ? { id: this.project!.id } : {}),
      name: value.name,
      description: value.description,
      userId: Number(value.userId),
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      projectStatus: Number(value.projectStatus),
    };
    this.save.emit(payload as any);
  }

  onCancel(): void {
    this.closed.emit();
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    if (ctrl.errors['maxlength'])
      return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters allowed.`;
    return 'Invalid value.';
  }
}