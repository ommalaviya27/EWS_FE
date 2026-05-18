import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TeamMember, ProjectOption, TaskStatuses, TaskPriority, TASK_STATUS_LIST, TASK_PRIORITY_LIST, CreateTaskRequest, UpdateTaskRequest } from '../../models/task-management.model';
import { Name, NameFieldConfig, Description, DescriptionFieldConfig } from '@common';

@Component({
  selector: 'app-task-addedit-modal',
  imports: [CommonModule, ReactiveFormsModule, Name, Description],
  templateUrl: './task-addedit-modal.html',
  styleUrl: './task-addedit-modal.css',
})
export class TaskAddeditModal implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isLoading = false;
  @Input() task: Task | null = null;
  @Input() teamMembers: TeamMember[] = [];
  @Input() projects: ProjectOption[] = [];

  @Output() save = new EventEmitter<CreateTaskRequest | UpdateTaskRequest>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  nameConfig!: NameFieldConfig;
  descriptionConfig!: DescriptionFieldConfig;

  statusList = TASK_STATUS_LIST;
  priorityList = TASK_PRIORITY_LIST;

  get isEditMode(): boolean {
    return this.task !== null;
  }

  ngOnInit(): void {
    this.buildForm();
    this.initConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.buildForm();
    }
  }

  private initConfigs(): void {
    this.nameConfig = { formControlName: 'title' };
    this.descriptionConfig = { formControlName: 'description', rows: 3 };
  }

  private buildForm(): void {
    const t = this.task;
    this.form = this.fb.group({
      title: [
        t?.title ?? '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(200)],
      ],
      description: [
        t?.description ?? '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(1000)],
      ],
      projectId: [t?.projectId ?? null, [Validators.required]],
      assignedToUserId: [t?.assignedToUserId ?? null, [Validators.required]],
      dueDate: [t ? this.toDateInput(t.dueDate) : '', [Validators.required]],
      status: [t?.taskStatus ?? TaskStatuses.Pending, [Validators.required]],
      priority: [t?.priority ?? TaskPriority.Medium, [Validators.required]],
    });
  }

  private toDateInput(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().substring(0, 10);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: CreateTaskRequest | UpdateTaskRequest = {
      ...(this.isEditMode ? { id: this.task!.id } : {}),
      title: v.title,
      description: v.description,
      projectId: v.projectId,
      assignedToUserId: Number(v.assignedToUserId),
      dueDate: new Date(v.dueDate).toISOString(),
      status: Number(v.status),
      priority: Number(v.priority),
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
